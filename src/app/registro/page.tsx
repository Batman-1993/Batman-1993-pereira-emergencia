"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CIUDADES } from "@/lib/constants";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    telefono: "",
    ciudad: "Pereira",
    esVoluntario: false,
    especialidad: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo crear la cuenta");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto card mt-8">
      <h1 className="text-xl font-bold mb-1">Crear cuenta</h1>
      <p className="text-sm text-slate-500 mb-4">
        Puedes registrarte como ciudadano o marcar que quieres ser voluntario rescatista.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label>Nombre completo</label>
          <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </div>
        <div>
          <label>Correo</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div>
          <label>Teléfono</label>
          <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        </div>
        <div>
          <label>Ciudad</label>
          <select value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })}>
            {CIUDADES.map((c) => (
              <option key={c.nombre} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 !mb-1">
          <input
            id="esVoluntario"
            type="checkbox"
            className="!w-auto"
            checked={form.esVoluntario}
            onChange={(e) => setForm({ ...form, esVoluntario: e.target.checked })}
          />
          <label htmlFor="esVoluntario" className="!mb-0">
            Quiero registrarme como voluntario rescatista
          </label>
        </div>
        {form.esVoluntario && (
          <div>
            <label>Especialidad / experiencia</label>
            <input
              placeholder="Ej. rescate en escombros, primeros auxilios, logística..."
              value={form.especialidad}
              onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
            />
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
