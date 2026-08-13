"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ESTADO_PERSONA_COLOR, ESTADO_PERSONA_LABELS } from "@/lib/constants";

type Person = {
  id: string;
  nombreCompleto: string;
  edad: number | null;
  ciudad: string;
  estado: string;
  fotoUrl: string | null;
  ultimaVezVisto: string | null;
};

export default function DesaparecidosPage() {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (estado) params.set("estado", estado);
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/missing-persons?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => setPersons(data.persons || []))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, estado]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">Personas desaparecidas</h1>
          <p className="text-sm text-slate-600">Base de datos comunitaria para buscar y reportar personas.</p>
        </div>
        <Link href="/desaparecidos/nuevo" className="btn btn-primary">
          + Reportar persona
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          className="max-w-xs"
          placeholder="Buscar por nombre, cédula o dirección..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="max-w-[220px]" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADO_PERSONA_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-slate-500">Buscando...</p>}
      {!loading && persons.length === 0 && <p className="text-sm text-slate-500">No hay resultados.</p>}

      <div className="grid sm:grid-cols-3 gap-3">
        {persons.map((p) => (
          <Link key={p.id} href={`/desaparecidos/${p.id}`} className="card hover:shadow-md transition">
            {p.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.fotoUrl} alt={p.nombreCompleto} className="rounded-lg h-40 w-full object-cover mb-2" />
            ) : (
              <div className="rounded-lg h-40 w-full bg-slate-100 flex items-center justify-center text-4xl mb-2">🧑</div>
            )}
            <p className="font-semibold">{p.nombreCompleto}</p>
            <p className="text-sm text-slate-500">{p.edad ? `${p.edad} años · ` : ""}{p.ciudad}</p>
            <span className="badge mt-2" style={{ background: ESTADO_PERSONA_COLOR[p.estado] }}>
              {ESTADO_PERSONA_LABELS[p.estado]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
