# Skill: Modelo de datos sindicato – Supabase

## Propósito
Definir el esquema de datos en Supabase (Postgres) para el sistema de credencial digital y red de beneficios del sindicato.

## Enums

- rol: `superadmin`, `admin`, `operador`, `prestador`, `afiliado`.
- categoria: `Activo`, `Adherente`, `Jubilado`, `Honorario`.
- estado_solicitud: `PENDIENTE`, `OBSERVADA`, `RECHAZADA`, `APROBADA`.
- estado_afiliado: `VIGENTE`, `SUSPENDIDO`, `BAJA`, `VENCIDO`.
- tipo_beneficio: `%_descuento`, `2x1`, `precio_fijo`, `otro`.
- resultado_escaneo: `VALIDO`, `NOVALIDO`, `VENCIDO`, `SUSPENDIDO`.

## Tablas

### usuarios_roles
- `id` (uuid, PK)
- `auth_user_id` (uuid, FK a `auth.users.id`, único)
- `rol` (enum `rol`)
- `afiliado_id` (uuid, FK `afiliados.id`, nullable)
- `prestador_id` (uuid, FK `prestadores.id`, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### afiliado_solicitudes
- `id` (uuid, PK)
- `dni` (int)
- `nombre`
- `apellido`
- `email`
- `telefono`
- `fecha_nacimiento` (date)
- `delegacion` (text)
- `categoria_solicitada` (enum `categoria`)
- `domicilio` (jsonb)
- `datos_laborales` (jsonb)
- `fotos_urls` (jsonb)
- `estado` (enum `estado_solicitud`)
- `observaciones_admin` (text)
- `fecha_creacion` (timestamp)
- `fecha_actualizacion` (timestamp)

### afiliados
- `id` (uuid, PK)
- `dni` (int, unique)
- `nombre`
- `apellido`
- `email`
- `telefono`
- `fecha_nacimiento` (date)
- `provincia_delegacion` (text)
- `delegacion_asignada` (text)
- `categoria` (enum `categoria`)
- `estado` (enum `estado_afiliado`)
- `domicilio` (jsonb)
- `datos_laborales` (jsonb)
- `fotos_urls` (jsonb)
- `numero_acta` (text)
- `fecha_acta` (date)
- `observaciones` (text)
- `ultimo_pago_mes` (date)
- `email_validado` (bool)
- `telefono_validado` (bool)
- `fecha_validacion_contacto` (date)
- `fecha_alta` (date)
- `fecha_vencimiento_credencial` (date)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### afiliado_validaciones_contacto
- `id` (uuid, PK)
- `afiliado_id` (uuid, FK `afiliados.id`)
- `tipo` (text: `email` o `telefono`)
- `canal` (text: `email`, `whatsapp`, `sms`)
- `fecha_envio` (timestamp)
- `fecha_confirmacion` (timestamp, nullable)
- `estado` (text: `PENDIENTE`, `CONFIRMADO`, `EXPIRADO`)

### prestador_solicitudes
- `id` (uuid, PK)
- `razon_social` (text)
- `nombre_fantasia` (text)
- `cuit` (text)
- `rubro` (text)
- `etiquetas` (text[])
- `beneficio_desc` (text)
- `descuento_pct` (numeric, nullable)
- `telefono` (text)
- `whatsapp` (text)
- `email` (text)
- `web` (text)
- `encargado` (text)
- `direccion` (text)
- `ciudad` (text)
- `provincia` (text)
- `latitud` (numeric, nullable)
- `longitud` (numeric, nullable)
- `logo_url` (text)
- `imagen_portada_url` (text)
- `estado` (enum `estado_solicitud`)
- `observaciones_admin` (text)
- `fecha_creacion` (timestamp)
- `fecha_actualizacion` (timestamp)

### prestadores
- `id` (uuid, PK)
- `razon_social` (text)
- `nombre_fantasia` (text)
- `cuit` (text)
- `rubro` (text)
- `etiquetas` (text[])
- `telefono` (text)
- `whatsapp` (text)
- `email` (text)
- `web` (text)
- `encargado` (text)
- `direccion` (text)
- `ciudad` (text)
- `provincia` (text)
- `latitud` (numeric, nullable)
- `longitud` (numeric, nullable)
- `logo_url` (text)
- `imagen_portada_url` (text)
- `estado` (text: `ACTIVO`, `INACTIVO`)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### beneficios
- `id` (uuid, PK)
- `prestador_id` (uuid, FK `prestadores.id`)
- `titulo` (text)
- `descripcion` (text)
- `tipo` (enum `tipo_beneficio`)
- `porcentaje_descuento` (numeric, nullable)
- `condiciones` (text)
- `rubro` (text)
- `ciudad` (text)
- `estado` (text: `ACTIVO`, `INACTIVO`)
- `fecha_inicio` (date, nullable)
- `fecha_fin` (date, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### afiliado_qr_tokens
- `id` (uuid, PK)
- `afiliado_id` (uuid, FK `afiliados.id`)
- `token` (text, único)
- `activo` (bool)
- `fecha_generacion` (timestamp)
- `fecha_expiracion` (timestamp, nullable)

### qr_escaneos
- `id` (uuid, PK)
- `afiliado_id` (uuid, FK `afiliados.id`)
- `prestador_id` (uuid, FK `prestadores.id`, nullable)
- `beneficio_id` (uuid, FK `beneficios.id`, nullable)
- `token_usado` (text)
- `resultado` (enum `resultado_escaneo`)
- `fecha_hora` (timestamp)
- `ip` (text, nullable)
- `user_agent` (text, nullable)

### historial_pagos
- `id` (uuid, PK)
- `afiliado_id` (uuid, FK `afiliados.id`)
- `periodo` (date)
- `monto` (numeric)
- `estado_pago` (text: `PAGADO`, `PENDIENTE`, `VENCIDO`)

### auditoria_logs
- `id` (uuid, PK)
- `entidad` (text: `afiliado`, `prestador`, `beneficio`, etc.)
- `entidad_id` (uuid)
- `campo` (text)
- `valor_anterior` (jsonb)
- `valor_nuevo` (jsonb)
- `usuario_id` (uuid, FK `usuarios_roles.id` o `auth.users.id`)
- `fecha_hora` (timestamp)
- `motivo` (text, nullable)


