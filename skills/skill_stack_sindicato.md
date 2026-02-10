# Skill: Stack y principios técnicos – Credencial Sindicato

## Propósito
Definir el stack tecnológico y las reglas técnicas que el agente debe respetar al implementar el sistema.

## Stack

- Frontend:
  - Framework: Next.js.
  - Configurado como Progressive Web App (PWA) con manifest y service worker.
  - Despliegue recomendado: Vercel.

- Backend / Persistencia:
  - Supabase como backend principal.
  - Base de datos: PostgreSQL gestionado (tablas y enums definidos en `skill_modelo_datos_sindicato.md`).
  - Autenticación: Supabase Auth.
  - Storage: buckets para fotos de afiliados, DNI, recibos, logos, imágenes de comercios.

## Autenticación y seguridad

- Identificación de afiliado:
  - La app debe exigir siempre la combinación `dni + telefono + email` para identificar un afiliado.
  - La triple coincidencia debe verificarse contra la tabla `afiliados`.
  - Si no hay coincidencia exacta, no se debe permitir acceso.

- Verificación activa:
  - Usar Supabase Auth para login sin contraseña:
    - Magic Link (email).
    - OTP (One-Time Password) por email o SMS/WhatsApp (según proveedor conectado).
  - La verificación activa complementa, pero no reemplaza, la regla de triple coincidencia de datos.

- Seguridad del QR:
  - No codificar el DNI directamente dentro del QR.
  - Codificar un `token` único almacenado en `afiliado_qr_tokens`.
  - El endpoint de validación debe:
    - Resolver el token a un `afiliado_id`.
    - Verificar `estado` del afiliado y `fecha_vencimiento_credencial`.
    - Mostrar información mínima necesaria para el comercio.

## PWA y estructura de la app

- La app debe funcionar bien en teléfonos como si fuera una app nativa.
- Configurar:
  - `manifest.json` con nombre, iconos y colores.
  - Service worker para soporte offline básico (al menos para recursos estáticos).
- Estructura sugerida de rutas Next.js:
  - `/login` → pantalla de ingreso de DNI + teléfono + email.
  - `/afiliado/credencial` → credencial digital con QR.
  - `/afiliado/beneficios` → catálogo de beneficios filtrable.
  - `/qr/validacion` → página que recibe token de QR y muestra resultado.
  - `/admin/*` → panel de administración (solicitudes, afiliados, prestadores, beneficios).

## Automatización (cron 140/150 días)

- Implementar lógica diaria (cron) para:
  - Buscar afiliados donde `fecha_validacion_contacto + 140 días == hoy`:
    - Registrar evento en `afiliado_validaciones_contacto`.
    - Disparar notificación de revalidación (email/WhatsApp).
  - Buscar afiliados donde `fecha_validacion_contacto + 150 días <= hoy` y `estado = 'VIGENTE'`:
    - Cambiar `estado` a `SUSPENDIDO`.

- Implementación técnica:
  - Preferente: usar `pg_cron` en la base de datos para programar estas funciones.
  - Alternativa: exponer una Edge Function HTTP en Supabase y programar un cron externo (p.ej. cron-job.org) para invocarla una vez al día.

- Cada vez que se confirme una revalidación:
  - Actualizar `email_validado` y/o `telefono_validado`.
  - Actualizar `fecha_validacion_contacto`.
  - Insertar registro en `afiliado_validaciones_contacto`.

## Estándares de implementación

- Todo el texto visible para usuarios debe estar en **español neutro**.
- Deben respetarse los nombres de tablas, columnas y enums definidos en el Skill de modelo de datos.
- Código organizado y legible:
  - Separar capa de acceso a datos (Supabase) de los componentes de UI.
  - Usar componentes reutilizables para formularios, tablas, listados de beneficios y tarjetas de credencial.
  - Evitar lógica de negocio compleja dentro de componentes de presentación.
- Seguridad y validaciones:
  - Validar en frontend y backend los datos críticos (DNI, email, teléfono) antes de crear o actualizar registros.
  - No exponer claves ni secretos de Supabase en el frontend; usar variables de entorno y APIs seguras cuando corresponda.
  - Asegurar que las rutas de administración (`/admin/*`) solo sean accesibles para roles `admin` o `superadmin`.
- Escalabilidad:
  - Diseñar el código y el esquema de datos pensando en que más adelante se puedan agregar módulos como noticias, notificaciones push y agenda de turnos sin reescribir el sistema.



