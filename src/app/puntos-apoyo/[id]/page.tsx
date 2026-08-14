import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import SupportPointDetailClient from "@/components/SupportPointDetailClient";

export const dynamic = "force-dynamic";

export default async function PuntoApoyoDetailPage({ params }: { params: { id: string } }) {
  const [point, session] = await Promise.all([
    prisma.supportPoint.findUnique({
      where: { id: params.id },
      include: {
        inventario: { orderBy: { nombre: "asc" } },
        donaciones: { orderBy: { createdAt: "desc" }, take: 30 },
        responsable: { select: { nombre: true, telefono: true } },
      },
    }),
    getSession(),
  ]);

  if (!point) notFound();

  const puedeGestionar = !!session && ["VOLUNTARIO", "ADMIN", "ADMIN_CENTRO"].includes(session.role);

  return (
    <SupportPointDetailClient
      pointId={point.id}
      initialPoint={point as any}
      puedeGestionar={puedeGestionar}
      estaLogueado={!!session}
    />
  );
}
