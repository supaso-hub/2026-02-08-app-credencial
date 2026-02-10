-- ==========================================
-- 1. ENUMS
-- ==========================================

-- Roles de sistema
DO $$ BEGIN
    CREATE TYPE public.rol_usuario AS ENUM ('superadmin', 'admin', 'operador', 'prestador', 'afiliado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipos de afiliados
DO $$ BEGIN
    CREATE TYPE public.tipo_afiliado AS ENUM ('ACTIVO', 'ADHERENTE', 'JUBILADO', 'HONORARIO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estados de la solicitud de afiliación
DO $$ BEGIN
    CREATE TYPE public.estado_solicitud AS ENUM ('PENDIENTE', 'OBSERVADA', 'RECHAZADA', 'APROBADA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estados del afiliado una vez vigente
DO $$ BEGIN
    CREATE TYPE public.estado_afiliado AS ENUM ('VIGENTE', 'SUSPENDIDO', 'BAJA', 'VENCIDO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipos de beneficios
DO $$ BEGIN
    CREATE TYPE public.tipo_beneficio AS ENUM ('%_descuento', '2x1', 'precio_fijo', 'otro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. TABLAS PRINCIPALES
-- ==========================================

-- Perfiles y Roles vinculados a auth.users
CREATE TABLE IF NOT EXISTS public.usuarios_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    rol public.rol_usuario NOT NULL DEFAULT 'afiliado',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla unificada de Afiliados
CREATE TABLE IF NOT EXISTS public.afiliados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dni TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    fecha_nacimiento DATE,
    tipo_afiliado public.tipo_afiliado NOT NULL,
    estado public.estado_afiliado NOT NULL DEFAULT 'VIGENTE',
    
    -- Datos laborales (requeridos para ACTIVO)
    cuit_empleador TEXT,
    razon_social_empleador TEXT,
    
    -- Datos adicionales
    domicilio JSONB, -- { calle, numero, piso, depto, ciudad, provincia }
    delegacion TEXT,
    foto_url TEXT,
    
    -- Control y Vigencia
    fecha_alta DATE DEFAULT CURRENT_DATE,
    fecha_vencimiento_credencial DATE,
    ultimo_pago_mes DATE,
    
    -- Seguimiento
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Solicitudes de Afiliación (Flujo de aprobación)
CREATE TABLE IF NOT EXISTS public.afiliado_solicitudes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dni TEXT NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    fecha_nacimiento DATE,
    tipo_afiliado public.tipo_afiliado NOT NULL,
    
    -- Datos laborales
    cuit_empleador TEXT,
    razon_social_empleador TEXT,
    
    -- Otros datos
    domicilio JSONB,
    delegacion TEXT,
    fotos_documentacion JSONB, -- URLs de fotos de DNI, recibo, etc.
    
    -- Estado del flujo
    estado public.estado_solicitud NOT NULL DEFAULT 'PENDIENTE',
    observaciones_admin TEXT,
    operador_id UUID REFERENCES public.usuarios_roles(id),
    revisado_por UUID REFERENCES public.usuarios_roles(id),
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prestadores (Comercios/Entidades)
CREATE TABLE IF NOT EXISTS public.prestadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razon_social TEXT NOT NULL,
    nombre_fantasia TEXT,
    cuit TEXT UNIQUE,
    rubro TEXT,
    email TEXT,
    telefono TEXT,
    direccion TEXT,
    ciudad TEXT,
    provincia TEXT,
    logo_url TEXT,
    estado TEXT NOT NULL DEFAULT 'ACTIVO', -- ACTIVO, INACTIVO
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Beneficios
CREATE TABLE IF NOT EXISTS public.beneficios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id UUID NOT NULL REFERENCES public.prestadores(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    tipo public.tipo_beneficio NOT NULL DEFAULT 'otro',
    porcentaje_descuento NUMERIC,
    condiciones TEXT,
    estado TEXT NOT NULL DEFAULT 'ACTIVO',
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 3. SEGURIDAD (RLS)
-- ==========================================

ALTER TABLE IF EXISTS public.usuarios_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.afiliados ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.afiliado_solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prestadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.beneficios ENABLE ROW LEVEL SECURITY;

-- Funciones auxiliares para verificar roles
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS public.rol_usuario AS $$
    SELECT rol FROM public.usuarios_roles WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- POLÍTICAS PARA usuarios_roles
CREATE POLICY "Superadmin tiene acceso total a roles"
ON public.usuarios_roles FOR ALL
TO authenticated
USING (public.get_auth_role() = 'superadmin');

CREATE POLICY "Usuarios pueden ver su propio rol"
ON public.usuarios_roles FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- POLÍTICAS PARA afiliados
CREATE POLICY "Superadmin y Admin ven todos los afiliados"
ON public.afiliados FOR SELECT
TO authenticated
USING (public.get_auth_role() IN ('superadmin', 'admin'));

CREATE POLICY "Operadores pueden ver afiliados"
ON public.afiliados FOR SELECT
TO authenticated
USING (public.get_auth_role() = 'operador');

CREATE POLICY "Afiliados ven su propia ficha"
ON public.afiliados FOR SELECT
TO authenticated
USING (dni = (SELECT dni FROM public.afiliados WHERE id = (SELECT id FROM public.usuarios_roles WHERE auth_user_id = auth.uid() LIMIT 1)));
-- Nota: La lógica anterior asume que vinculamos auth.users con afiliados. 
-- Ajustamos para que sea por auth.uid() si el afiliado tiene usuario.
DROP POLICY IF EXISTS "Afiliados ven su propia ficha" ON public.afiliados;
CREATE POLICY "Afiliados ven su propia ficha"
ON public.afiliados FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.usuarios_roles ur 
    WHERE ur.auth_user_id = auth.uid() 
    AND (ur.email = public.afiliados.email OR ur.rol = 'superadmin')
));

-- POLÍTICAS PARA afiliado_solicitudes
CREATE POLICY "Superadmin y Admin gestionan solicitudes"
ON public.afiliado_solicitudes FOR ALL
TO authenticated
USING (public.get_auth_role() IN ('superadmin', 'admin'));

CREATE POLICY "Operadores insertan y ven solicitudes"
ON public.afiliado_solicitudes FOR SELECT
TO authenticated
USING (public.get_auth_role() = 'operador');

CREATE POLICY "Operadores pueden crear solicitudes"
ON public.afiliado_solicitudes FOR INSERT
TO authenticated
WITH CHECK (public.get_auth_role() = 'operador');

-- POLÍTICAS PARA prestadores y beneficios (lectura pública para autenticados)
CREATE POLICY "Cualquier autenticado ve prestadores y beneficios"
ON public.prestadores FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Cualquier autenticado ve beneficios"
ON public.beneficios FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin y Superadmin gestionan prestadores"
ON public.prestadores FOR ALL
TO authenticated
USING (public.get_auth_role() IN ('superadmin', 'admin'));

CREATE POLICY "Admin y Superadmin gestionan beneficios"
ON public.beneficios FOR ALL
TO authenticated
USING (public.get_auth_role() IN ('superadmin', 'admin'));

-- ==========================================
-- 4. TRIGGERS (Opcional pero recomendado para updated_at)
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_roles BEFORE UPDATE ON public.usuarios_roles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER set_updated_at_afiliados BEFORE UPDATE ON public.afiliados FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER set_updated_at_solicitudes BEFORE UPDATE ON public.afiliado_solicitudes FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER set_updated_at_prestadores BEFORE UPDATE ON public.prestadores FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER set_updated_at_beneficios BEFORE UPDATE ON public.beneficios FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
