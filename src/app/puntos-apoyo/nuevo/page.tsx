"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DynamicMap from "@/components/DynamicMap";
import { CATEGORIA_PUNTO_ICONO, CATEGORIA_PUNTO_LABELS, CIUDADES, ciudadCoords } from "@/lib/constants";
import { useGeocode } from "@/lib/useGeocode";

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

  const geocodeQuery = direccion.trim() ? `${direccion}, ${ciudad}, Colombia` : "";
  const { status: geoStatus, result: geoResult } = useGeocode(geocodeQuery);
  useEffect(() => {
    if (geoResult) setPin(geoResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoResult]);

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
          {geoStatus === "buscando" && <p className="text-xs text-slate-500 mt-1">Buscando dirección en el mapa...</p>}
          {geoStatus === "encontrado" && <p className="text-xs text-green-700 mt-1">📍 Ubicación encontrada, ajústala en el mapa si hace falta.</p>}
          {geoStatus === "no-encontrado" && <p className="text-xs text-amber-700 mt-1">No encontramos esa dirección exacta, marca el punto en el mapa.</p>}
        </div>
        <div>
          <label>Capacidad (personas o raciones, opcional)</label>
          <input type="number" min={0} value={capacidad} onChange={(e) => setCapacidad(e.target.value)} placeholder="Ej. 180 almuerzos al día" />
        </div>
        <div>
          <label>Ubicación en el mapa (toca para marcar o ajustar)</label>
          <DynamicMap
            center={pin || [center.lat, center.lng]}
            zoom={14}
            pin={pin}
            flyTo={pin}
            onMapClick={(lat, lng) => setPin([lat, lng])}
            height="320px"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Guardando..." : "Registrar punto"}
        </button>
      </form>
    </div>
  );
}
