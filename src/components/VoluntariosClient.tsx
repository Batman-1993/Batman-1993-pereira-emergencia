"use client";

import Link from "next/link";
import LiveIndicator from "@/components/LiveIndicator";
import { usePolling } from "@/lib/usePolling";
import { ESTADO_COLOR, ESTADO_LABELS, TIPO_LABELS, URGENCIA_COLOR, URGENCIA_LABELS } from "@/lib/constants";

type ReportRow = { id: string; titulo: string; tipo: string; urgencia: string; estado: string; ciudad: string };

type Resumen = {
  pendientes: ReportRow[];
  misAsignaciones: ReportRow[];
  resueltosHoy: number;
  nombre: string;
};

export default function VoluntariosClient({ initialResumen }: { initialResumen: Resumen }) {
  const { data, updatedAt, refresh } = usePolling<Resumen>("/api/voluntarios/resumen", 10000);
  const resumen = data ?? initialResumen;
  const criticos = resumen.pendientes.filter((r) => r.urgencia === "CRITICA").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Panel de voluntarios</h1>
        <p className="text-sm text-slate-600">Hola {resumen.nombre}, aquí puedes ver y atender reportes activos.</p>
      </div>

      <LiveIndicator updatedAt={updatedAt} onRefresh={refresh} />

      <div className="flex gap-3 flex-wrap text-sm">
        <span className="badge" style={{ background: URGENCIA_COLOR.CRITICA }}>🔴 {criticos} críticos sin resolver</span>
        <span className="badge" style={{ background: "#0f172a" }}>📋 {resumen.pendientes.length} pendientes/en atención</span>
        <span className="badge" style={{ background: ESTADO_COLOR.RESUELTO }}>✅ {resumen.resueltosHoy} resueltos hoy</span>
      </div>

      {resumen.misAsignaciones.length > 0 && (
        <div>
          <h2 className="font-bold mb-2">Mis reportes asignados</h2>
          <ReportTable reports={resumen.misAsignaciones} />
        </div>
      )}

      <div>
        <h2 className="font-bold mb-2">Todos los reportes activos (por urgencia)</h2>
        <ReportTable reports={resumen.pendientes} />
      </div>
    </div>
  );
}

function ReportTable({ reports }: { reports: ReportRow[] }) {
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
