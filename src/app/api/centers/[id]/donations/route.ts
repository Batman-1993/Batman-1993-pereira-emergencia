import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  const body = await req.json().catch(() => null);
  const { item, cantidad, unidad, donanteNombre, categoria } = body || {};
  if (!item || typeof cantidad !== "number" || cantidad <= 0) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const [donation] = await prisma.$transaction([
    prisma.donation.create({
      data: {
        centerId: params.id,
        item,
        cantidad,
        unidad: unidad || "unidades",
        donanteId: session?.sub,
        donanteNombre: donanteNombre || session?.nombre,
      },
    }),
    prisma.inventoryItem.upsert({
      where: { centerId_nombre: { centerId: params.id, nombre: item } },
      update: { cantidad: { increment: cantidad }, unidad: unidad || "unidades" },
      create: {
        centerId: params.id,
        nombre: item,
        categoria: categoria || "otros",
        cantidad,
        unidad: unidad || "unidades",
      },
    }),
  ]);

  return NextResponse.json({ donation });
}
