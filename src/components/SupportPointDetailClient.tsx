"use client";

import DynamicMap from "@/components/DynamicMap";
import SupportPointPanel from "@/components/SupportPointPanel";
import SupportPointBadges from "@/components/SupportPointBadges";
import LiveIndicator from "@/components/LiveIndicator";
import { usePolling } from "@/lib/usePolling";
import { CATEGORIA_PUNTO_COLOR, CATEGORIA_PUNTO_ICONO } from "@/lib/constants";

export type SupportPointDetail = {
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
  telefono: string | null;
  inventario: { id: string; nombre: string; categoria: string; cantidad: number; unidad: string }[];
  donaciones: { id: string; item: string; cantidad: number; unidad: string; donanteNombre: string | null }[];
};

export default function SupportPointDetailClient({
  pointId,
  initialPoint,
  puedeGestionar,
  estaLogueado,
}: {
  pointId: string;
  initialPoint: SupportPointDetail;
  puedeGestionar: boolean;
  estaLogueado: boolean;
}) {
  const { data, updatedAt, refresh } = usePolling<{ point: SupportPointDetail }>(
    `/api/support-points/${pointId}`,
    8000
  );
  const point = data?.point ?? initialPoint;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold">{point.nombre}</h1>
        <p className="text-sm text-slate-600">{point.direccion} · {point.ciudad}</p>
        {point.telefono && <p className="text-sm text-slate-600">📞 {point.telefono}</p>}
      </div>

      <LiveIndicator updatedAt={updatedAt} onRefresh={refresh} />

      <SupportPointBadges categoria={point.categoria} abierto={point.abierto} ultimaConfirmacion={point.ultimaConfirmacion} />

      <div className="flex gap-3 flex-wrap text-sm">
        <span className="badge bg-slate-900">
          👥 {point.personasAyudadas}
          {point.capacidad ? `/${point.capacidad}` : ""} personas ayudadas
        </span>
      </div>

      <DynamicMap
        center={[point.lat, point.lng]}
        zoom={15}
        height="260px"
        points={[
          {
            id: point.id,
            lat: point.lat,
            lng: point.lng,
            color: CATEGORIA_PUNTO_COLOR[point.categoria] || "#475569",
            emoji: CATEGORIA_PUNTO_ICONO[point.categoria],
            label: point.nombre,
            href: `/puntos-apoyo/${point.id}`,
          },
        ]}
      />

      <div className="card">
        <h3 className="font-semibold mb-2">Inventario actual</h3>
        {point.inventario.length === 0 ? (
          <p className="text-sm text-slate-500">Sin insumos registrados todavía.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-1">Insumo</th>
                <th>Categoría</th>
                <th className="text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {point.inventario.map((i) => (
                <tr key={i.id} className="border-t border-slate-100">
                  <td className="py-1">{i.nombre}</td>
                  <td className="capitalize">{i.categoria}</td>
                  <td className="text-right">{i.cantidad} {i.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SupportPointPanel pointId={point.id} puedeGestionar={puedeGestionar} abierto={point.abierto} onSaved={refresh} />

      {point.donaciones.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-2">Últimas donaciones</h3>
          <ul className="text-sm space-y-1">
            {point.donaciones.map((d) => (
              <li key={d.id} className="flex justify-between border-t border-slate-100 pt-1">
                <span>{d.item} · {d.cantidad} {d.unidad}</span>
                <span className="text-slate-500">{d.donanteNombre || "Anónimo"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!estaLogueado && (
        <p className="text-sm text-slate-500">
          ¿Eres voluntario?{" "}
          <a href="/login" className="text-red-600 font-semibold">
            Inicia sesión
          </a>{" "}
          para confirmar este punto o registrar personas ayudadas.
        </p>
      )}
    </div>
  );
}
