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
- **Prisma ORM + Postgres** — misma base de datos en desarrollo y producción (gratis con [Neon](https://neon.tech)).
- **Leaflet + OpenStreetMap** — mapas reales sin necesidad de API key ni tarjeta de crédito.
- **Web Push (VAPID)** — notificaciones push nativas del navegador, sin depender de Firebase.
- **Tailwind CSS** — estilos simples y responsivos, pensados para pantallas de celular y botones grandes usables bajo estrés.
- Autenticación propia con JWT en cookie httpOnly (bcrypt para contraseñas) — sin dependencias externas de pago.

## Correr en local

Necesitas una base Postgres (gratis en 1 minuto con [Neon](https://neon.tech): crea un proyecto y copia el "connection string").

```bash
npm install
cp .env.example .env    # pega tu DATABASE_URL de Neon en .env
npx prisma migrate dev --name init   # crea las tablas
npm run db:seed                      # (opcional) datos de ejemplo: reportes, puntos de apoyo, voluntario demo
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

## Desplegar en producción (gratis, ~10 minutos)

La app ya está lista para **Vercel + Postgres** sin tocar código: la base de datos es Postgres desde el inicio y las fotos se guardan como datos en la base (no en disco), así que funcionan tal cual en un hosting serverless como Vercel.

1. **Base de datos**: crea una cuenta gratis en [neon.tech](https://neon.tech), crea un proyecto y copia el "connection string" (empieza con `postgresql://...`).
2. **Desplegar**: entra a [vercel.com/new](https://vercel.com/new), "Import Git Repository" y selecciona `Batman-1993/pereira-emergencia`.
3. En "Environment Variables" agrega:
   - `DATABASE_URL` → el connection string de Neon del paso 1
   - `JWT_SECRET` → cualquier cadena larga y aleatoria (ej. `openssl rand -base64 48`)
   - `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` → genera el par con `npx web-push generate-vapid-keys`
   - `VAPID_SUBJECT` → `mailto:tu-correo@dominio.com`
4. En "Build Command" de Vercel pon: `npx prisma migrate deploy && npm run build` (así crea las tablas automáticamente en el primer despliegue).
5. Deploy. En 1-2 minutos tienes una URL pública (`https://tu-app.vercel.app`) que funciona desde cualquier celular.

Después de desplegar, corre `npm run db:seed` apuntando tu `.env` local a la misma `DATABASE_URL` de Neon si quieres cargar los datos de ejemplo también en producción (opcional — bórralos luego desde la base si eran solo para probar).

**Nota sobre fotos**: se guardan como `data:` URLs directamente en Postgres (funciona en cualquier hosting sin configurar nada extra). Si el volumen de fotos crece mucho, conviene migrar `src/lib/upload.ts` a un bucket (S3, Cloudflare R2, Cloudinary) para no inflar la base de datos — no es necesario para empezar.

Alternativa: **Railway** o **Render** también sirven (conectan igual a la base de Neon), útiles si más adelante quieres disco persistente para otros usos.

## Modelo de datos (resumen)

- `Report`: reportes de emergencia (tipo, urgencia semáforo, estado, ubicación, fotos, historial de seguimiento `ReportStatusLog`, asignaciones de voluntarios).
- `User`: ciudadanos y voluntarios rescatistas (`role`: CIUDADANO, VOLUNTARIO, ADMIN_CENTRO, ADMIN).
- `MissingPerson`: personas desaparecidas.
- `SupportPoint` + `InventoryItem` + `Donation`: puntos de apoyo (acopio, salud, cocina, carga/WiFi, social) con categoría, estado abierto/cerrado, verificación (`verificado` + `ultimaConfirmacion`), inventario y donaciones registradas.
- `PushSubscription`: suscripciones a notificaciones push, por ciudad.

Los "enums" de negocio (tipos de reporte, niveles de urgencia, categorías, estados) viven como texto validado en `src/lib/constants.ts` en vez de `enum` de Prisma — más simple de extender (ej. agregar una categoría nueva de punto de apoyo es un solo cambio en ese archivo).

## Qué falta para un despliegue de producción real

Esta es una base funcional completa (auth, mapa, reportes, voluntarios, centros de acopio, desaparecidos, push, PWA), pero antes de operarla en una emergencia real conviene sumar:

- **Moderación / verificación de reportes** para evitar información falsa (ej. panel de administración que pueda marcar un reporte como `DESCARTADO`, ya soportado en el modelo).
- **Integración oficial** con Cruz Roja, Bomberos, UNGRD o la alcaldía, para que los reportes críticos lleguen también a sus canales oficiales.
- **SMS/alertas por línea de emergencia** para personas sin internet (ej. Twilio), ya que la app depende de datos móviles o wifi.
- **Cumplimiento de habeas data** para la base de personas desaparecidas (datos sensibles: identificación, fotos, dirección) — revisar con un abogado el manejo y tiempo de retención de estos datos según la Ley 1581 de 2012 (Colombia).
- **Backups automáticos** de la base de datos y almacenamiento redundante de fotos.
- **Rate limiting / anti-spam** en los formularios públicos (reportar, desaparecidos) para evitar abuso.
- **Roles de administrador** para gestionar centros de acopio, verificar voluntarios y descartar reportes duplicados o falsos.
