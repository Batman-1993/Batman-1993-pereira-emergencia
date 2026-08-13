"use client";

import { CATEGORIA_PUNTO_COLOR, CATEGORIA_PUNTO_ICONO, CATEGORIA_PUNTO_LABELS, estadoConfirmacion } from "@/lib/constants";

export default function SupportPointBadges({
  categoria,
  abierto,
  ultimaConfirmacion,
}: {
  categoria: string;
  abierto: boolean;
  ultimaConfirmacion: string | Date | null;
}) {
  const confirmacion = estadoConfirmacion(ultimaConfirmacion);
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <span className="badge" style={{ background: CATEGORIA_PUNTO_COLOR[categoria] || "#475569" }}>
        {CATEGORIA_PUNTO_ICONO[categoria]} {CATEGORIA_PUNTO_LABELS[categoria] || categoria}
      </span>
      <span className="badge" style={{ background: confirmacion.color }}>
        {confirmacion.label}
      </span>
      <span className="badge" style={{ background: abierto ? "#16a34a" : "#6b7280" }}>
        {abierto ? "Abierto" : "Cerrado"}
      </span>
    </div>
  );
}
