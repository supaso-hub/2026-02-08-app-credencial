# Skill: Dominio Sindicato – Reglas de negocio

## Propósito
Definir las reglas funcionales y los flujos de negocio de un sistema de credencial digital y red de beneficios para un sindicato, incluyendo actores, estados y procesos clave.

## Actores
- Afiliado:
  - Persona que solicita afiliación al sindicato y, una vez aprobada, accede a una credencial digital y a una red de beneficios.
- Prestador:
  - Comercio o entidad que ofrece beneficios a los afiliados.
- Administrador:
  - Roles: superadmin, admin, operador.
  - Gestiona solicitudes, estados de afiliados, prestadores y catálogo de beneficios.

## Flujos principales

### Afiliación
- Toda afiliación comienza como registro en `afiliado_solicitudes`.
- Estados de `afiliado_solicitudes`: `PENDIENTE`, `OBSERVADA`, `RECHAZADA`, `APROBADA`.
- El administrador revisa datos y documentación:
  - Si aprueba, se crea/actualiza un registro en `afiliados`.
  - Si observa, se deja constancia en `observaciones_admin` y el solicitante debe corregir/completar datos.
  - Si rechaza, la solicitud no genera afiliado activo.

### Gestión de afiliados
- Tabla principal: `afiliados`.
- Estados de afiliado (`estado`): `VIGENTE`, `SUSPENDIDO`, `BAJA`, `VENCIDO`.
- El DNI actúa como número de afiliado y debe ser único.
- El afiliado tiene:
  - Datos personales (nombre, apellido, fecha_nacimiento, email, telefono).
  - Delegación y categoría (Activo, Adherente, Jubilado, Honorario).
  - Información adicional en campos jsonb (`domicilio`, `datos_laborales`, `fotos_urls`).
  - Control económico: `ultimo_pago_mes`.
  - Control de contacto: `email_validado`, `telefono_validado`, `fecha_validacion_contacto`.
  - Control de credencial: `fecha_alta`, `fecha_vencimiento_credencial`.

### Gestión de prestadores
- Toda alta de prestador comienza como registro en `prestador_solicitudes`.
- Estados de `prestador_solicitudes`: `PENDIENTE`, `OBSERVADA`, `RECHAZADA`, `APROBADA`.
- Una vez aprobada, se crea/actualiza registro en `prestadores` con estado `ACTIVO` o `INACTIVO`.
- Un prestador puede tener múltiples beneficios asociados en la tabla `beneficios`.

### Red de beneficios
- Cada registro en `beneficios` pertenece a un `prestador`.
- Un beneficio tiene:
  - Título, descripción, tipo (`%_descuento`, `2x1`, `precio_fijo`, `otro`).
  - Porcentaje de descuento (cuando aplica).
  - Condiciones (días, horarios, topes, restricciones).
  - Estado (`ACTIVO`, `INACTIVO`).
- Para el afiliado:
  - La app debe mostrar un catálogo de beneficios filtrable por rubro y ciudad.
  - A futuro puede usarse geolocalización (latitud/longitud) para ordenar por cercanía.

## Autenticación de afiliado
- Para acceder a la app, el afiliado debe identificarse por triple coincidencia:
  - `dni` + `telefono` + `email` deben coincidir exactamente con un registro en `afiliados`.
- Solo se debe permitir acceso a afiliados cuyo `estado` no sea `BAJA` y, por defecto, se prioriza `VIGENTE`.
- La verificación activa (link mágico / OTP) se realiza utilizando Supabase Auth, pero la lógica de negocio de triple coincidencia se controla con la tabla `afiliados`.

## Validación de contacto (regla 140/150 días)
- La fecha de referencia es `fecha_validacion_contacto` en `afiliados`.
- A los 140 días:
  - El sistema debe enviar aviso al afiliado para revalidar email y/o teléfono.
- A los 150 días:
  - Si no se ha confirmado la revalidación, el `estado` del afiliado pasa automáticamente a `SUSPENDIDO`.
- Cada proceso de revalidación debe registrarse en `afiliado_validaciones_contacto`.

## Credencial digital y QR
- La credencial digital del afiliado debe mostrar:
  - Foto.
  - Nombre y apellido.
  - DNI (número de afiliado).
  - Delegación.
  - Categoría.
  - Fecha de vencimiento.
- La credencial incluye un código QR generado a partir de la tabla `afiliado_qr_tokens`.
- El QR no debe contener el DNI en texto plano; debe codificar un `token` seguro asociado al afiliado.

## Uso del QR en comercios
- El afiliado presenta su credencial y QR en el comercio.
- El prestador escanea el QR y accede a una página de validación que:
  - Recibe el token.
  - Consulta el estado actual del afiliado.
  - Muestra:
    - Resultado: “Afiliado válido” o “Afiliado no válido”.
    - Nombre y apellido.
    - DNI/número de afiliado.
    - Categoría y delegación.
    - Estado de vigencia (VIGENTE, SUSPENDIDO, BAJA, VENCIDO).
    - Fecha y hora de vencimiento.
- Opcionalmente, se registra el escaneo en `qr_escaneos` para auditoría y estadísticas.


