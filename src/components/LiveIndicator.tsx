"use client";

export default function LiveIndicator({
  updatedAt,
  onRefresh,
}: {
  updatedAt: Date | null;
  onRefresh: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span>
        En vivo{updatedAt ? ` · actualizado ${updatedAt.toLocaleTimeString("es-CO")}` : ""}
      </span>
      <button type="button" onClick={onRefresh} className="underline">
        Actualizar ahora
      </button>
    </div>
  );
}
