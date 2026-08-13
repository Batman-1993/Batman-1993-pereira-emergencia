"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DynamicMap from "@/components/DynamicMap";
import { CATEGORIA_PUNTO_ICONO, CATEGORIA_PUNTO_LABELS, CIUDADES, ciudadCoords } from "@/lib/constants";

export default function NuevoPuntoApoyoPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("ACOPIO");
  const [ciudad, setCiudad] = useState("Pereira");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [pin, setPin] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const center = ciudadCoords(ciudad);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin) {
      setError("Marca la ubicación del punto en el mapa");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/support-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        categoria,
        ciudad,
        direccion,
        telefono,
        capacidad: capacidad ? Number(capacidad) : null,
        lat: pin[0],
        lng: pin[1],
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo crear el punto. ¿Iniciaste sesión?");
      return;
    }
    const data = await res.json();
    router.push(`/puntos-apoyo/${data.point.id}`);
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Registrar punto de apoyo</h1>
      <p className="text-sm text-slate-600">
        Acopio, puesto de salud, cocina comunitaria, punto de carga/WiFi o punto social.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label>Categoría</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(CATEGORIA_PUNTO_LABELS).map(([k, v]) => (
              <button
                type="button"
                key={k}
                onClick={() => setCategoria(k)}
                className={`btn text-sm ${categoria === k ? "btn-secondary" : "btn-outline"}`}
              >
                {CATEGORIA_PUNTO_ICONO[k]} {v}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label>Nombre</label>
          <input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Cocina Comunitaria Boston" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label>Ciudad</label>
            <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
              {CIUDADES.map((c) => (
                <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Teléfono de contacto</label>
            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>
        </div>
        <div>
          <label>Dirección</label>
          <input required value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </div>
        <div>
          <label>Capacidad (personas o raciones, opcional)</label>
          <input type="number" min={0} value={capacidad} onChange={(e) => setCapacidad(e.target.value)} placeholder="Ej. 180 almuerzos al día" />
        </div>
        <div>
          <label>Ubicación en el mapa (toca para marcar)</label>
          <DynamicMap center={pin || [center.lat, center.lng]} zoom={14} pin={pin} onMapClick={(lat, lng) => setPin([lat, lng])} height="320px" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Guardando..." : "Registrar punto"}
        </button>
      </form>
    </div>
  );
}
