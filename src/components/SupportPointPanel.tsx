"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIAS = ["agua", "alimentos", "aseo", "medicinas", "abrigo", "otros"];

export default function SupportPointPanel({
  pointId,
  puedeGestionar,
  abierto,
}: {
  pointId: string;
  puedeGestionar: boolean;
  abierto: boolean;
}) {
  const router = useRouter();
  const [item, setItem] = useState("");
  const [categoria, setCategoria] = useState("alimentos");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("unidades");
  const [donanteNombre, setDonanteNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [accionLoading, setAccionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function donar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!item || !cantidad || Number(cantidad) <= 0) {
      setError("Indica el insumo y una cantidad válida");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/support-points/${pointId}/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item, categoria, cantidad: Number(cantidad), unidad, donanteNombre }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo registrar la donación");
      return;
    }
    setItem("");
    setCantidad("");
    router.refresh();
  }

  async function accion(body: Record<string, unknown>) {
    setAccionLoading(true);
    await fetch(`/api/support-points/${pointId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setAccionLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {puedeGestionar && (
        <div className="card space-y-3">
          <h3 className="font-semibold">Control de ejecución</h3>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-outline" disabled={accionLoading} onClick={() => accion({ confirmar: true })}>
              ✅ Confirmar que sigue activo
            </button>
            <button className="btn btn-outline" disabled={accionLoading} onClick={() => accion({ abierto: !abierto })}>
              {abierto ? "Marcar como cerrado" : "Marcar como abierto"}
            </button>
          </div>
          <div>
            <p className="text-sm mb-1 font-semibold">Registrar personas ayudadas</p>
            <div className="flex gap-2">
              {[1, 5, 10, 50].map((n) => (
                <button key={n} className="btn btn-outline" disabled={accionLoading} onClick={() => accion({ personasAyudadasIncremento: n })}>
                  +{n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={donar} className="card space-y-3">
        <h3 className="font-semibold">Registrar donación</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label>Insumo</label>
            <input required value={item} onChange={(e) => setItem(e.target.value)} placeholder="Ej. Agua embotellada" />
          </div>
          <div>
            <label>Categoría</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label>Cantidad</label>
            <input type="number" min={1} required value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          </div>
          <div>
            <label>Unidad</label>
            <input value={unidad} onChange={(e) => setUnidad(e.target.value)} />
          </div>
          <div>
            <label>Donante (opcional)</label>
            <input value={donanteNombre} onChange={(e) => setDonanteNombre(e.target.value)} />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Guardando..." : "Registrar donación"}
        </button>
      </form>
    </div>
  );
}
