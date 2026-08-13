"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DynamicMap from "@/components/DynamicMap";
import SupportPointBadges from "@/components/SupportPointBadges";
import {
  CATEGORIA_PUNTO_COLOR,
  CATEGORIA_PUNTO_ICONO,
  CATEGORIA_PUNTO_LABELS,
  CIUDADES,
  ciudadCoords,
  distanciaKm,
  estadoConfirmacion,
} from "@/lib/constants";

type SupportPoint = {
  id: string;
  nombre: string;
  categoria: string;
  ciudad: string;
  direccion: string;
  lat: number;
  lng: number;
  abierto: boolean;
  verificado: boolean;
  ultimaConfirmacion: string | null;
  capacidad: number | null;
  personasAyudadas: number;
};

export default function PuntosApoyoPage() {
  const [ciudad, setCiudad] = useState("Pereira");
  const [categoria, setCategoria] = useState("");
  const [points, setPoints] = useState<SupportPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (ciudad) params.set("ciudad", ciudad);
    if (categoria) params.set("categoria", categoria);
    setLoading(true);
    fetch(`/api/support-points?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setPoints(data.points || []))
      .finally(() => setLoading(false));
  }, [ciudad, categoria]);

  const center = useMemo(() => {
    const c = ciudadCoords(ciudad);
    return [c.lat, c.lng] as [number, number];
  }, [ciudad]);

  const sorted = useMemo(() => {
    if (!userPos) return points;
    return [...points].sort(
      (a, b) => distanciaKm(userPos, [a.lat, a.lng]) - distanciaKm(userPos, [b.lat, b.lng])
    );
  }, [points, userPos]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">Puntos de apoyo</h1>
          <p className="text-sm text-slate-600">
            Acopio, salud, cocinas comunitarias, carga/WiFi y puntos sociales, con su estado de verificación.
          </p>
        </div>
        <Link href="/puntos-apoyo/nuevo" className="btn btn-primary">
          + Registrar punto
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="min-w-[160px]">
          <label>Ciudad</label>
          <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
            {CIUDADES.map((c) => (
              <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          className={`btn text-sm ${categoria === "" ? "btn-secondary" : "btn-outline"}`}
          onClick={() => setCategoria("")}
        >
          Todas
        </button>
        {Object.entries(CATEGORIA_PUNTO_LABELS).map(([k, v]) => (
          <button
            key={k}
            className={`btn text-sm ${categoria === k ? "btn-secondary" : "btn-outline"}`}
            onClick={() => setCategoria(k)}
          >
            {CATEGORIA_PUNTO_ICONO[k]} {v}
          </button>
        ))}
      </div>

      <div className="card text-xs text-slate-600">
        <span className="font-semibold">Última confirmación: </span>
        <span className="inline-flex items-center gap-1 mr-3">🟢 Reciente (&lt; 1 h)</span>
        <span className="inline-flex items-center gap-1 mr-3">🟠 Horas (&lt; 24 h)</span>
        <span className="inline-flex items-center gap-1">🔴 Sin confirmar (&gt; 24 h)</span>
      </div>

      <DynamicMap
        center={center}
        points={sorted.map((p) => ({
          id: p.id,
          lat: p.lat,
          lng: p.lng,
          color: CATEGORIA_PUNTO_COLOR[p.categoria] || "#475569",
          emoji: CATEGORIA_PUNTO_ICONO[p.categoria],
          label: p.nombre,
          sublabel: `${CATEGORIA_PUNTO_LABELS[p.categoria]} · ${estadoConfirmacion(p.ultimaConfirmacion).label}`,
          href: `/puntos-apoyo/${p.id}`,
        }))}
      />

      {loading && <p className="text-sm text-slate-500">Cargando...</p>}
      {!loading && sorted.length === 0 && <p className="text-sm text-slate-500">No hay puntos de apoyo todavía en esta ciudad/categoría.</p>}

      <div className="grid sm:grid-cols-2 gap-3">
        {sorted.map((p) => (
          <Link key={p.id} href={`/puntos-apoyo/${p.id}`} className="card hover:shadow-md transition space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{p.nombre}</p>
              {userPos && (
                <span className="text-xs text-slate-500 shrink-0">{distanciaKm(userPos, [p.lat, p.lng]).toFixed(1)} km</span>
              )}
            </div>
            <p className="text-sm text-slate-500">{p.direccion} · {p.ciudad}</p>
            <SupportPointBadges categoria={p.categoria} abierto={p.abierto} ultimaConfirmacion={p.ultimaConfirmacion} />
            {p.capacidad ? (
              <p className="text-sm text-slate-600">👥 {p.personasAyudadas}/{p.capacidad}</p>
            ) : p.personasAyudadas > 0 ? (
              <p className="text-sm text-slate-600">👥 {p.personasAyudadas} ayudadas</p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
