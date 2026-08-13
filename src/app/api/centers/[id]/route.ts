import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const center = await prisma.collectionCenter.findUnique({
    where: { id: params.id },
    include: {
      inventario: { orderBy: { nombre: "asc" } },
      donaciones: { orderBy: { createdAt: "desc" }, take: 30 },
      responsable: { select: { nombre: true, telefono: true } },
    },
  });
  if (!center) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ center });
}

// Registra personas ayudadas en este centro (control de ejecución).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !["VOLUNTARIO", "ADMIN", "ADMIN_CENTRO"].includes(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const incremento = Number(body?.personasAyudadasIncremento || 0);

  const center = await prisma.collectionCenter.update({
    where: { id: params.id },
    data: { personasAyudadas: { increment: incremento } },
  });

  return NextResponse.json({ center });
}
