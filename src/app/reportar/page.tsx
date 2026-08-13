"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DynamicMap from "@/components/DynamicMap";
import { CIUDADES, ciudadCoords, TIPO_LABELS, URGENCIA_LABELS } from "@/lib/constants";
import { useGeocode } from "@/lib/useGeocode";

export default function ReportarPage() {
  const router = useRouter();
  const [ciudad, setCiudad] = useState("Pereira");
  const [tipo, setTipo] = useState("RESCATE");
  const [urgencia, setUrgencia] = useState("CRITICA");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [personasAfectadas, setPersonasAfectadas] = useState("");
  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoTelefono, setContactoTelefono] = useState("");
  const [pin, setPin] = useState<[number, number] | null>(null);
  const [fotos, setFotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setPin([pos.coords.latitude, pos.coords.longitude]),
      () => setError("No se pudo obtener tu ubicación. Marca el punto en el mapa manualmente.")
    );
  }

  // Al escribir la dirección, la buscamos y movemos el pin/mapa solos
  // (funciona igual en escritorio y celular, no depende del mouse).
  const geocodeQuery = direccion.trim() ? `${direccion}, ${ciudad}, Colombia` : "";
  const { status: geoStatus, result: geoResult } = useGeocode(geocodeQuery);
  useEffect(() => {
    if (geoResult) setPin(geoResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoResult]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pin) {
      setError("Marca la ubicación en el mapa (o usa 'Usar mi ubicación').");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.set("tipo", tipo);
    fd.set("urgencia", urgencia);
    fd.set("titulo", titulo);
    fd.set("descripcion", descripcion);
    fd.set("ciudad", ciudad);
    fd.set("direccion", direccion);
    fd.set("lat", String(pin[0]));
    fd.set("lng", String(pin[1]));
    fd.set("personasAfectadas", personasAfectadas || "0");
    fd.set("contactoNombre", contactoNombre);
    fd.set("contactoTelefono", contactoTelefono);
    fotos.forEach((f) => fd.append("fotos", f));

    const res = await fetch("/api/reports", { method: "POST", body: fd });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo enviar el reporte. Intenta de nuevo.");
      return;
    }
    const data = await res.json();
    router.push(`/reportes/${data.report.id}`);
  }

  const center = ciudadCoords(ciudad);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">🚨 Reportar emergencia</h1>
      <p className="text-sm text-slate-600">
        No necesitas cuenta para reportar. Entre más información des, más rápido puede llegar la ayuda.
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label>Tipo de reporte</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {Object.entries(TIPO_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Urgencia</label>
            <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)}>
              {Object.entries(URGENCIA_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label>Título breve</label>
          <input required maxLength={120} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Edificio colapsado con personas atrapadas" />
        </div>

        <div>
          <label>Descripción</label>
          <textarea required rows={4} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Describe la situación con el mayor detalle posible" />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label>Ciudad</label>
            <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
              {CIUDADES.map((c) => (
                <option key={c.nombre} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Dirección / punto de referencia</label>
            <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ej. Cra 10 # 20-30, barrio Cuba" />
            {geoStatus === "buscando" && <p className="text-xs text-slate-500 mt-1">Buscando dirección en el mapa...</p>}
            {geoStatus === "encontrado" && <p className="text-xs text-green-700 mt-1">📍 Ubicación encontrada, ajústala en el mapa si hace falta.</p>}
            {geoStatus === "no-encontrado" && <p className="text-xs text-amber-700 mt-1">No encontramos esa dirección exacta, marca el punto en el mapa.</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="!mb-0">Ubicación en el mapa (toca para marcar o ajustar)</label>
            <button type="button" onClick={useMyLocation} className="text-xs text-red-600 font-semibold">
              📍 Usar mi ubicación
            </button>
          </div>
          <DynamicMap
            center={pin || [center.lat, center.lng]}
            zoom={14}
            pin={pin}
            flyTo={pin}
            onMapClick={(lat, lng) => setPin([lat, lng])}
            height="320px"
          />
        </div>

        <div>
          <label>Personas afectadas (aprox.)</label>
          <input type="number" min={0} value={personasAfectadas} onChange={(e) => setPersonasAfectadas(e.target.value)} />
        </div>

        <div>
          <label>Fotos (opcional, ayuda mucho)</label>
          <input type="file" accept="image/*" multiple capture="environment" onChange={(e) => setFotos(Array.from(e.target.files || []))} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label>Tu nombre (contacto)</label>
            <input value={contactoNombre} onChange={(e) => setContactoNombre(e.target.value)} />
          </div>
          <div>
            <label>Tu teléfono (contacto)</label>
            <input value={contactoTelefono} onChange={(e) => setContactoTelefono(e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Enviando..." : "Enviar reporte"}
        </button>
      </form>
    </div>
  );
}
