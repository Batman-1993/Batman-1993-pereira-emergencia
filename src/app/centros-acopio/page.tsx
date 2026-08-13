import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CentrosAcopioPage() {
  const centers = await prisma.collectionCenter.findMany({
    include: { _count: { select: { inventario: true, donaciones: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Centros de acopio</h1>
          <p className="text-sm text-slate-600">Inventario de donaciones y personas ayudadas por centro.</p>
        </div>
        <Link href="/centros-acopio/nuevo" className="btn btn-primary">
          + Registrar centro
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {centers.map((c) => (
          <Link key={c.id} href={`/centros-acopio/${c.id}`} className="card hover:shadow-md transition">
            <p className="font-semibold">{c.nombre}</p>
            <p className="text-sm text-slate-500">{c.direccion} · {c.ciudad}</p>
            <div className="flex gap-3 text-sm mt-2 text-slate-600">
              <span>📦 {c._count.inventario} tipos de insumos</span>
              <span>👥 {c.personasAyudadas} ayudadas</span>
            </div>
          </Link>
        ))}
        {centers.length === 0 && <p className="text-sm text-slate-500">Aún no hay centros de acopio registrados.</p>}
      </div>
    </div>
  );
}
