import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ciudad = searchParams.get("ciudad");
  const categoria = searchParams.get("categoria");
  const points = await prisma.supportPoint.findMany({
    where: {
      ...(ciudad ? { ciudad } : {}),
      ...(categoria ? { categoria } : {}),
    },
    include: { _count: { select: { inventario: true, donaciones: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ points });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { nombre, categoria, ciudad, direccion, lat, lng, capacidad, telefono } = body || {};
  if (!nombre || !direccion || typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const point = await prisma.supportPoint.create({
    data: {
      nombre,
      categoria: categoria || "ACOPIO",
      ciudad: ciudad || "Pereira",
      direccion,
      lat,
      lng,
      capacidad: capacidad || null,
      telefono: telefono || null,
      responsableId: session.sub,
      // El punto queda "verificado" desde su creación, hecha por una persona real.
      verificado: true,
      ultimaConfirmacion: new Date(),
    },
  });

  return NextResponse.json({ point });
}
