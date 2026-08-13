import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import DynamicMap from "@/components/DynamicMap";
import CenterPanel from "@/components/CenterPanel";

export const dynamic = "force-dynamic";

export default async function CentroDetailPage({ params }: { params: { id: string } }) {
  const [center, session] = await Promise.all([
    prisma.collectionCenter.findUnique({
      where: { id: params.id },
      include: {
        inventario: { orderBy: { nombre: "asc" } },
        donaciones: { orderBy: { createdAt: "desc" }, take: 30 },
        responsable: { select: { nombre: true, telefono: true } },
      },
    }),
    getSession(),
  ]);

  if (!center) notFound();

  const puedeGestionar = !!session && ["VOLUNTARIO", "ADMIN", "ADMIN_CENTRO"].includes(session.role);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold">{center.nombre}</h1>
        <p className="text-sm text-slate-600">{center.direccion} · {center.ciudad}</p>
        {center.telefono && <p className="text-sm text-slate-600">📞 {center.telefono}</p>}
      </div>

      <div className="flex gap-3 flex-wrap text-sm">
        <span className="badge bg-slate-900">👥 {center.personasAyudadas} personas ayudadas</span>
        {center.capacidad ? <span className="badge bg-slate-600">Capacidad: {center.capacidad}</span> : null}
      </div>

      <DynamicMap center={[center.lat, center.lng]} zoom={15} height="260px" />

      <div className="card">
        <h3 className="font-semibold mb-2">Inventario actual</h3>
        {center.inventario.length === 0 ? (
          <p className="text-sm text-slate-500">Sin insumos registrados todavía.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-1">Insumo</th>
                <th>Categoría</th>
                <th className="text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {center.inventario.map((i) => (
                <tr key={i.id} className="border-t border-slate-100">
                  <td className="py-1">{i.nombre}</td>
                  <td className="capitalize">{i.categoria}</td>
                  <td className="text-right">{i.cantidad} {i.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CenterPanel centerId={center.id} puedeGestionar={puedeGestionar} />

      {center.donaciones.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-2">Últimas donaciones</h3>
          <ul className="text-sm space-y-1">
            {center.donaciones.map((d) => (
              <li key={d.id} className="flex justify-between border-t border-slate-100 pt-1">
                <span>{d.item} · {d.cantidad} {d.unidad}</span>
                <span className="text-slate-500">{d.donanteNombre || "Anónimo"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
