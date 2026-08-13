import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import DynamicMap from "@/components/DynamicMap";
import ReportActions from "@/components/ReportActions";
import { ESTADO_COLOR, ESTADO_LABELS, TIPO_LABELS, URGENCIA_COLOR, URGENCIA_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const [report, session] = await Promise.all([
    prisma.report.findUnique({
      where: { id: params.id },
      include: {
        fotos: true,
        reportadoPor: { select: { nombre: true } },
        statusLogs: { orderBy: { createdAt: "asc" }, include: { autor: { select: { nombre: true } } } },
        asignaciones: { include: { voluntario: { select: { nombre: true, telefono: true } } } },
      },
    }),
    getSession(),
  ]);

  if (!report) notFound();

  const puedeGestionar = session && ["VOLUNTARIO", "ADMIN"].includes(session.role);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="badge" style={{ background: URGENCIA_COLOR[report.urgencia] }}>
          {URGENCIA_LABELS[report.urgencia]}
        </span>
        <span className="badge" style={{ background: ESTADO_COLOR[report.estado] }}>
          {ESTADO_LABELS[report.estado]}
        </span>
        <span className="text-sm text-slate-500">{TIPO_LABELS[report.tipo]} · {report.ciudad}</span>
      </div>

      <h1 className="text-2xl font-bold">{report.titulo}</h1>
      <p className="whitespace-pre-wrap">{report.descripcion}</p>

      {report.direccion && <p className="text-sm text-slate-600">📍 {report.direccion}</p>}
      {!!report.personasAfectadas && (
        <p className="text-sm text-slate-600">👥 Personas afectadas (aprox.): {report.personasAfectadas}</p>
      )}
      {(report.contactoNombre || report.reportadoPor) && (
        <p className="text-sm text-slate-600">
          Reportado por: {report.contactoNombre || report.reportadoPor?.nombre}
          {report.contactoTelefono ? ` · ${report.contactoTelefono}` : ""}
        </p>
      )}

      {report.fotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {report.fotos.map((f) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={f.id} src={f.url} alt="" className="rounded-lg h-32 w-full object-cover" />
          ))}
        </div>
      )}

      <DynamicMap center={[report.lat, report.lng]} zoom={16} markers={[{
        id: report.id,
        lat: report.lat,
        lng: report.lng,
        titulo: report.titulo,
        urgencia: report.urgencia,
        tipo: report.tipo,
        estado: report.estado,
        href: `/reportes/${report.id}`,
      }]} height="300px" />

      {report.asignaciones.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-1">Voluntarios asignados</h3>
          <ul className="text-sm list-disc list-inside">
            {report.asignaciones.map((a) => (
              <li key={a.id}>{a.voluntario.nombre}{a.voluntario.telefono ? ` · ${a.voluntario.telefono}` : ""}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold mb-2">Seguimiento / evolución</h3>
        <ol className="space-y-2">
          {report.statusLogs.map((log) => (
            <li key={log.id} className="text-sm border-l-2 border-slate-300 pl-3">
              <span className="font-semibold">{ESTADO_LABELS[log.estado]}</span>{" "}
              <span className="text-slate-400">— {new Date(log.createdAt).toLocaleString("es-CO")}</span>
              {log.autor?.nombre && <span className="text-slate-500"> · {log.autor.nombre}</span>}
              {log.nota && <p className="text-slate-600">{log.nota}</p>}
            </li>
          ))}
        </ol>
      </div>

      {puedeGestionar && <ReportActions reportId={report.id} estadoActual={report.estado} />}
      {!session && (
        <p className="text-sm text-slate-500">
          ¿Eres voluntario rescatista? <a href="/login" className="text-red-600 font-semibold">Inicia sesión</a> para actualizar el estado de este reporte.
        </p>
      )}
    </div>
  );
}
