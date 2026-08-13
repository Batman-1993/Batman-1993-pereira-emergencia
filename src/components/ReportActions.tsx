"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ESTADO_LABELS } from "@/lib/constants";

export default function ReportActions({ reportId, estadoActual }: { reportId: string; estadoActual: string }) {
  const router = useRouter();
  const [estado, setEstado] = useState(estadoActual);
  const [nota, setNota] = useState("");
  const [asignarme, setAsignarme] = useState(true);
  const [loading, setLoading] = useState(false);

  async function guardar() {
    setLoading(true);
    const res = await fetch(`/api/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, nota, asignarme }),
    });
    setLoading(false);
    if (res.ok) {
      setNota("");
      router.refresh();
    }
  }

  return (
    <div className="card border-red-200">
      <h3 className="font-semibold mb-2">Actualizar estado (voluntarios)</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label>Nuevo estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            {Object.entries(ESTADO_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2 pb-1">
          <input id="asignarme" type="checkbox" className="!w-auto" checked={asignarme} onChange={(e) => setAsignarme(e.target.checked)} />
          <label htmlFor="asignarme" className="!mb-0">Asignarme este reporte</label>
        </div>
      </div>
      <div className="mt-2">
        <label>Nota de seguimiento (opcional)</label>
        <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej. Equipo en camino, ETA 20 min" />
      </div>
      <button className="btn btn-primary mt-3" onClick={guardar} disabled={loading}>
        {loading ? "Guardando..." : "Guardar actualización"}
      </button>
    </div>
  );
}
