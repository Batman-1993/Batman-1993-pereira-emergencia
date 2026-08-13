"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DynamicMap from "@/components/DynamicMap";
import PushSubscribeButton from "@/components/PushSubscribeButton";
import { CIUDADES, ciudadCoords, ESTADO_COLOR, ESTADO_LABELS, TIPO_LABELS, URGENCIA_COLOR, URGENCIA_LABELS } from "@/lib/constants";

type ReportRow = {
  id: string;
  titulo: string;
  tipo: string;
  urgencia: string;
  estado: string;
  ciudad: string;
  lat: number;
  lng: number;
  createdAt: string;
  fotos: { url: string }[];
};

export default function HomePage() {
  const [ciudad, setCiudad] = useState("Pereira");
  const [tipo, setTipo] = useState("");
  const [urgencia, setUrgencia] = useState("");
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (ciudad) params.set("ciudad", ciudad);
    if (tipo) params.set("tipo", tipo);
    if (urgencia) params.set("urgencia", urgencia);
    setLoading(true);
    fetch(`/api/reports?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setReports(data.reports || []))
      .finally(() => setLoading(false));
  }, [ciudad, tipo, urgencia]);

  const center = useMemo(() => {
    const c = ciudadCoords(ciudad);
    return [c.lat, c.lng] as [number, number];
  }, [ciudad]);

  const counts = useMemo(() => {
    return {
      criticas: reports.filter((r) => r.urgencia === "CRITICA" && r.estado !== "RESUELTO").length,
      moderadas: reports.filter((r) => r.urgencia === "MODERADA" && r.estado !== "RESUELTO").length,
      resueltos: reports.filter((r) => r.estado === "RESUELTO").length,
    };
  }, [reports]);

  return (
    <div className="space-y-4">
      <div className="card bg-red-50 border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-red-700">Mapa de emergencias — {ciudad}</h1>
          <p className="text-sm text-slate-600">
            Reporta daños, personas atrapadas, edificios en riesgo o falta de agua/alimentos. Todo reporte queda
            visible aquí al instante para voluntarios y organismos de socorro.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/reportar" className="btn btn-primary">
            🚨 Reportar emergencia
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="min-w-[160px]">
          <label>Ciudad</label>
          <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
            {CIUDADES.map((c) => (
              <option key={c.nombre} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[180px]">
          <label>Tipo de reporte</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(TIPO_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[160px]">
          <label>Urgencia</label>
          <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)}>
            <option value="">Todas</option>
            {Object.entries(URGENCIA_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <PushSubscribeButton ciudad={ciudad} />
      </div>

      <div className="flex gap-3 flex-wrap text-sm">
        <span className="badge" style={{ background: URGENCIA_COLOR.CRITICA }}>
          🔴 {counts.criticas} críticos activos
        </span>
        <span className="badge" style={{ background: URGENCIA_COLOR.MODERADA }}>
          🟡 {counts.moderadas} moderados activos
        </span>
        <span className="badge" style={{ background: ESTADO_COLOR.RESUELTO }}>
          🟢 {counts.resueltos} resueltos
        </span>
      </div>

      <DynamicMap
        center={center}
        markers={reports.map((r) => ({
          id: r.id,
          lat: r.lat,
          lng: r.lng,
          titulo: r.titulo,
          urgencia: r.urgencia as any,
          tipo: r.tipo as any,
          estado: r.estado,
          href: `/reportes/${r.id}`,
        }))}
      />

      <div>
        <h2 className="font-bold text-lg mb-2">Reportes recientes</h2>
        {loading && <p className="text-sm text-slate-500">Cargando...</p>}
        {!loading && reports.length === 0 && (
          <p className="text-sm text-slate-500">No hay reportes con estos filtros todavía.</p>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          {reports.slice(0, 20).map((r) => (
            <Link key={r.id} href={`/reportes/${r.id}`} className="card block hover:shadow-md transition">
              <div className="flex items-center justify-between gap-2">
                <span className="badge" style={{ background: URGENCIA_COLOR[r.urgencia] }}>
                  {URGENCIA_LABELS[r.urgencia]}
                </span>
                <span className="badge" style={{ background: ESTADO_COLOR[r.estado] }}>
                  {ESTADO_LABELS[r.estado]}
                </span>
              </div>
              <p className="font-semibold mt-2">{r.titulo}</p>
              <p className="text-sm text-slate-500">{TIPO_LABELS[r.tipo]} · {r.ciudad}</p>
              {r.fotos[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.fotos[0].url} alt="" className="mt-2 rounded-lg h-32 w-full object-cover" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
