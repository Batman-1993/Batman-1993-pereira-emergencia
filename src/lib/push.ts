import webpush from "web-push";
import { prisma } from "./prisma";

let configured = false;

function ensureConfigured() {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

// Notifica a todos los suscritos de una ciudad (o a todos si ciudad es null)
// cuando entra un reporte nuevo. Falla en silencio si las llaves VAPID no
// están configuradas (para que la app funcione igual sin push en dev).
export async function notifyNewReport(report: {
  id: string;
  titulo: string;
  urgencia: string;
  ciudad: string;
  tipo: string;
}) {
  if (!ensureConfigured()) return;

  const subs = await prisma.pushSubscription.findMany({
    where: { OR: [{ ciudad: report.ciudad }, { ciudad: null }] },
  });

  const payload = JSON.stringify({
    title: report.urgencia === "CRITICA" ? "🔴 Emergencia crítica reportada" : "Nuevo reporte de emergencia",
    body: `${report.titulo} — ${report.ciudad}`,
    url: `/reportes/${report.id}`,
  });

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    })
  );
}
