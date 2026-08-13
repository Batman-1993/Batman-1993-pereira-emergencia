import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { nombre, categoria, cantidad, unidad } = body || {};
  if (!nombre || !categoria || typeof cantidad !== "number") {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const item = await prisma.inventoryItem.upsert({
    where: { pointId_nombre: { pointId: params.id, nombre } },
    update: { cantidad: { increment: cantidad }, categoria, unidad: unidad || "unidades" },
    create: { pointId: params.id, nombre, categoria, cantidad, unidad: unidad || "unidades" },
  });

  return NextResponse.json({ item });
}
