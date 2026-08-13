import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ESTADO_COLOR, ESTADO_LABELS, TIPO_LABELS, URGENCIA_COLOR, URGENCIA_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function VoluntariosPage() {
  const session = await getSession();
  if (!session || !["VOLUNTARIO", "ADMIN"].includes(session.role)) {
    redirect("/login");
  }

  const [pendientes, misAsignaciones, resueltosHoy] = await Promise.all([
    prisma.report.findMany({
      where: { estado: { in: ["PENDIENTE", "EN_ATENCION"] } },
      orderBy: [{ urgencia: "asc" }, { createdAt: "asc" }],
      take: 100,
    }),
    prisma.report.findMany({
      where: { asignaciones: { some: { voluntarioId: session.sub } }, estado: { not: "RESUELTO" } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.report.count({
      where: { estado: "RESUELTO", updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
  ]);

  const criticos = pendientes.filter((r) => r.urgencia === "CRITICA").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Panel de voluntarios</h1>
        <p className="text-sm text-slate-600">Hola {session.nombre}, aquí puedes ver y atender reportes activos.</p>
      </div>

      <div className="flex gap-3 flex-wrap text-sm">
        <span className="badge" style={{ background: URGENCIA_COLOR.CRITICA }}>🔴 {criticos} críticos sin resolver</span>
        <span className="badge" style={{ background: "#0f172a" }}>📋 {pendientes.length} pendientes/en atención</span>
        <span className="badge" style={{ background: ESTADO_COLOR.RESUELTO }}>✅ {resueltosHoy} resueltos hoy</span>
      </div>

      {misAsignaciones.length > 0 && (
        <div>
          <h2 className="font-bold mb-2">Mis reportes asignados</h2>
          <ReportTable reports={misAsignaciones} />
        </div>
      )}

      <div>
        <h2 className="font-bold mb-2">Todos los reportes activos (por urgencia)</h2>
        <ReportTable reports={pendientes} />
      </div>
    </div>
  );
}

function ReportTable({ reports }: { reports: any[] }) {
  if (reports.length === 0) return <p className="text-sm text-slate-500">Nada por aquí.</p>;
  return (
    <div className="space-y-2">
      {reports.map((r) => (
        <Link key={r.id} href={`/reportes/${r.id}`} className="card flex items-center justify-between gap-3 hover:shadow-md transition">
          <div>
            <p className="font-semibold">{r.titulo}</p>
            <p className="text-sm text-slate-500">{TIPO_LABELS[r.tipo]} · {r.ciudad}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className="badge" style={{ background: URGENCIA_COLOR[r.urgencia] }}>{URGENCIA_LABELS[r.urgencia]}</span>
            <span className="badge" style={{ background: ESTADO_COLOR[r.estado] }}>{ESTADO_LABELS[r.estado]}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
