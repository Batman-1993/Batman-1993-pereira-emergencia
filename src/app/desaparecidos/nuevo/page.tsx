"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CIUDADES } from "@/lib/constants";

export default function NuevoDesaparecidoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombreCompleto: "",
    identificacion: "",
    edad: "",
    genero: "",
    direccion: "",
    ciudad: "Pereira",
    descripcion: "",
    ultimaVezVisto: "",
    reportadoPorNombre: "",
    reportadoPorTelefono: "",
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    if (foto) fd.set("foto", foto);

    const res = await fetch("/api/missing-persons", { method: "POST", body: fd });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo registrar. Revisa los campos obligatorios.");
      return;
    }
    const data = await res.json();
    router.push(`/desaparecidos/${data.person.id}`);
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Reportar persona desaparecida</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label>Nombre completo</label>
          <input required value={form.nombreCompleto} onChange={(e) => set("nombreCompleto", e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label>Identificación</label>
            <input value={form.identificacion} onChange={(e) => set("identificacion", e.target.value)} />
          </div>
          <div>
            <label>Edad</label>
            <input type="number" min={0} value={form.edad} onChange={(e) => set("edad", e.target.value)} />
          </div>
          <div>
            <label>Género</label>
            <input value={form.genero} onChange={(e) => set("genero", e.target.value)} />
          </div>
        </div>
        <div>
          <label>Dirección donde se le vio / vivía</label>
          <input value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label>Ciudad</label>
            <select value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)}>
              {CIUDADES.map((c) => (
                <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Última vez visto (fecha/lugar)</label>
            <input value={form.ultimaVezVisto} onChange={(e) => set("ultimaVezVisto", e.target.value)} />
          </div>
        </div>
        <div>
          <label>Descripción física / señas particulares</label>
          <textarea rows={3} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} />
        </div>
        <div>
          <label>Foto</label>
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label>Tu nombre (quien reporta)</label>
            <input required value={form.reportadoPorNombre} onChange={(e) => set("reportadoPorNombre", e.target.value)} />
          </div>
          <div>
            <label>Tu teléfono de contacto</label>
            <input required value={form.reportadoPorTelefono} onChange={(e) => set("reportadoPorTelefono", e.target.value)} />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Guardando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
}
