# Pereira Emergencia 🚨

Plataforma web (PWA) para coordinar la respuesta ante el terremoto en Pereira y Risaralda: reportes de daños con semáforo de urgencia, mapa en tiempo real, voluntarios rescatistas, centros de acopio con inventario y control de personas ayudadas, base de datos de personas desaparecidas, y seguimiento de la evolución de cada emergencia.

Funciona desde el navegador de **cualquier celular** (Android/iPhone), sin necesidad de instalar nada de una tienda de apps — es instalable como PWA (ícono en la pantalla de inicio) y soporta notificaciones push.

## Funcionalidades

- **Reportar emergencias** sin necesidad de cuenta: tipo de daño (rescate, edificio en riesgo de caerse, falta de agua, falta de alimentos, otro), nivel de urgencia estilo semáforo (🔴 crítica / 🟡 moderada / 🟢 leve), ubicación en el mapa, fotos, y datos de contacto.
- **Mapa en tiempo real** por ciudad (Pereira, Dosquebradas, Santa Rosa de Cabal, La Virginia, Marsella, Cartago — fácil de ampliar a más ciudades) con marcadores de colores por urgencia.
- **Notificaciones push** al celular cuando entra un reporte nuevo en tu ciudad (Web Push, funciona incluso con la app cerrada en Android; en iPhone requiere instalar la PWA primero, ver abajo).
- **Cuentas de voluntarios rescatistas**: cualquiera puede registrarse como voluntario, ver los reportes activos ordenados por urgencia, asignarse un caso y actualizar su estado (pendiente → en atención → resuelto), dejando un historial de seguimiento (evolución del desastre).
- **Puntos de apoyo** (acopio, salud, cocinas comunitarias, carga/WiFi, social): registro en el mapa con tags de categoría, inventario de donaciones por tipo (agua, alimentos, aseo, medicinas, abrigo...), registro de donaciones, contador de personas ayudadas/capacidad, estado abierto/cerrado, distancia a tu ubicación, y un semáforo de "última confirmación" (🟢 reciente < 1 h / 🟠 horas < 24 h / 🔴 sin confirmar > 24 h) que los voluntarios actualizan con un botón de "Confirmar".
- **Personas desaparecidas**: base de datos comunitaria con nombre, identificación, edad, dirección, foto, descripción y estado (desaparecido / encontrado con vida / encontrado fallecido), con buscador.

## Stack técnico

- **Next.js 14** (App Router) + TypeScript — una sola app para frontend y backend (API routes).
- **Prisma ORM** — SQLite en desarrollo (cero configuración), fácilmente migrable a Postgres en producción.
- **Leaflet + OpenStreetMap** — mapas reales sin necesidad de API key ni tarjeta de crédito.
- **Web Push (VAPID)** — notificaciones push nativas del navegador, sin depender de Firebase.
- **Tailwind CSS** — estilos simples y responsivos, pensados para pantallas de celular y botones grandes usables bajo estrés.
- Autenticación propia con JWT en cookie httpOnly (bcrypt para contraseñas) — sin dependencias externas de pago.

## Correr en local

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init   # crea la base SQLite y aplica el esquema
npm run db:seed                      # (opcional) datos de ejemplo: reportes, centro de acopio, voluntario demo
npm run dev
```

Abre http://localhost:3000

Usuario voluntario de prueba (si corriste el seed): `voluntario@demo.co` / `voluntario123`.

## Activar notificaciones push

1. Genera un par de llaves VAPID:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Pon `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` en tu `.env` (o en las variables de entorno del hosting).
3. Los usuarios que entren a la app verán un botón "🔔 Activar notificaciones de emergencia" en la página principal.

Sin estas llaves configuradas, la app funciona igual — simplemente no se envían notificaciones push (falla en silencio).

## Instalar como app (PWA)

- **Android (Chrome)**: menú ⋮ → "Instalar app" / "Agregar a pantalla de inicio".
- **iPhone (Safari)**: botón compartir → "Agregar a pantalla de inicio". En iOS las notificaciones push solo funcionan después de instalarla así (requisito de Apple).

## Desplegar en producción

La forma más simple es **Vercel** (plan gratuito sirve para empezar):

1. Sube este repositorio a GitHub (ya está) y conéctalo en https://vercel.com/new.
2. Configura las variables de entorno (`DATABASE_URL`, `JWT_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`).
3. **Importante**: Vercel no tiene disco persistente, así que para producción real necesitas:
   - **Base de datos**: cambia `provider = "sqlite"` por `provider = "postgresql"` en `prisma/schema.prisma` y usa una base gestionada (ej. [Neon](https://neon.tech), [Supabase](https://supabase.com) o [Vercel Postgres](https://vercel.com/storage/postgres), todas con plan gratuito).
   - **Fotos**: el guardado actual escribe en `public/uploads` (sirve para correr en un servidor tradicional con disco persistente, ej. una VM o Railway/Render). En Vercel debes reemplazar `src/lib/upload.ts` por un bucket como S3, Cloudflare R2 o Cloudinary.
4. Corre `npx prisma migrate deploy` contra la base de producción antes del primer despliegue.

Alternativa sin estos límites: desplegar en **Railway** o **Render** con un volumen persistente — ahí `public/uploads` y SQLite/Postgres funcionan tal cual, sin cambios de código.

## Modelo de datos (resumen)

- `Report`: reportes de emergencia (tipo, urgencia semáforo, estado, ubicación, fotos, historial de seguimiento `ReportStatusLog`, asignaciones de voluntarios).
- `User`: ciudadanos y voluntarios rescatistas (`role`: CIUDADANO, VOLUNTARIO, ADMIN_CENTRO, ADMIN).
- `MissingPerson`: personas desaparecidas.
- `SupportPoint` + `InventoryItem` + `Donation`: puntos de apoyo (acopio, salud, cocina, carga/WiFi, social) con categoría, estado abierto/cerrado, verificación (`verificado` + `ultimaConfirmacion`), inventario y donaciones registradas.
- `PushSubscription`: suscripciones a notificaciones push, por ciudad.

Los "enums" de negocio (tipos de reporte, niveles de urgencia, estados) viven como texto validado en `src/lib/constants.ts`, porque SQLite no soporta enums nativos de Prisma; si migras a Postgres puedes convertirlos a `enum` reales sin tocar el resto de la app.

## Qué falta para un despliegue de producción real

Esta es una base funcional completa (auth, mapa, reportes, voluntarios, centros de acopio, desaparecidos, push, PWA), pero antes de operarla en una emergencia real conviene sumar:

- **Moderación / verificación de reportes** para evitar información falsa (ej. panel de administración que pueda marcar un reporte como `DESCARTADO`, ya soportado en el modelo).
- **Integración oficial** con Cruz Roja, Bomberos, UNGRD o la alcaldía, para que los reportes críticos lleguen también a sus canales oficiales.
- **SMS/alertas por línea de emergencia** para personas sin internet (ej. Twilio), ya que la app depende de datos móviles o wifi.
- **Cumplimiento de habeas data** para la base de personas desaparecidas (datos sensibles: identificación, fotos, dirección) — revisar con un abogado el manejo y tiempo de retención de estos datos según la Ley 1581 de 2012 (Colombia).
- **Backups automáticos** de la base de datos y almacenamiento redundante de fotos.
- **Rate limiting / anti-spam** en los formularios públicos (reportar, desaparecidos) para evitar abuso.
- **Roles de administrador** para gestionar centros de acopio, verificar voluntarios y descartar reportes duplicados o falsos.
