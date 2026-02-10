-- ==========================================
-- SEED DATA
-- ==========================================

-- 1. Insertar Superadmin inicial
-- Nota: Este script busca el usuario en auth.users por email. 
-- Si el usuario aún no se ha registrado vía Supabase Auth, esta inserción no hará nada.
INSERT INTO public.usuarios_roles (auth_user_id, email, rol)
SELECT id, email, 'superadmin'
FROM auth.users
WHERE email = 'hugo.vezzato.supaso@gmail.com'
ON CONFLICT (auth_user_id) DO UPDATE SET rol = 'superadmin';

-- 2. Insertar un Prestador de prueba
INSERT INTO public.prestadores (id, razon_social, nombre_fantasia, cuit, rubro, ciudad, provincia, estado)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Farmacia Central S.A.',
    'Farmacia del Sindicato',
    '30-12345678-9',
    'Farmacia',
    'Posadas',
    'Misiones',
    'ACTIVO'
) ON CONFLICT (cuit) DO NOTHING;

-- 3. Insertar Beneficios para el prestador de prueba
INSERT INTO public.beneficios (prestador_id, titulo, descripcion, tipo, porcentaje_descuento, condiciones)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Descuento en Medicamentos',
    '20% de descuento en medicamentos seleccionados presentando la credencial digital.',
    '%_descuento',
    20,
    'Válido todos los días. No acumulable con otras promociones.'
) ON CONFLICT DO NOTHING;

INSERT INTO public.beneficios (prestador_id, titulo, descripcion, tipo, condiciones)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '2x1 en Perfumería',
    '2x1 en productos de perfumería de marca propia.',
    '2x1',
    'Válido los días lunes y martes.'
) ON CONFLICT DO NOTHING;

-- 4. Insertar un Afiliado de prueba (para testing inicial)
INSERT INTO public.afiliados (dni, nombre, apellido, email, telefono, tipo_afiliado, estado, cuit_empleador, delegacion)
VALUES (
    '12345678',
    'Juan',
    'Perez',
    'juan.perez@example.com',
    '3764000000',
    'ACTIVO',
    'VIGENTE',
    '30-99999999-9',
    'Delegación Capital'
) ON CONFLICT (dni) DO NOTHING;
