"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ESTADO_PERSONA_LABELS } from "@/lib/constants";

export default function MissingPersonActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function marcar(estado: string) {
    setLoading(estado);
    const res = await fetch(`/api/missing-persons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="card">
      <h3 className="font-semibold mb-2">Actualizar estado</h3>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(ESTADO_PERSONA_LABELS).map(([k, v]) => (
          <button key={k} className="btn btn-outline text-sm" disabled={loading === k} onClick={() => marcar(k)}>
            {loading === k ? "Guardando..." : v}
          </button>
        ))}
      </div>
    </div>
  );
}
