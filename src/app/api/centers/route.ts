import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ciudad = searchParams.get("ciudad");
  const centers = await prisma.collectionCenter.findMany({
    where: ciudad ? { ciudad } : {},
    include: { _count: { select: { inventario: true, donaciones: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ centers });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { nombre, ciudad, direccion, lat, lng, capacidad, telefono } = body || {};
  if (!nombre || !direccion || typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const center = await prisma.collectionCenter.create({
    data: {
      nombre,
      ciudad: ciudad || "Pereira",
      direccion,
      lat,
      lng,
      capacidad: capacidad || null,
      telefono: telefono || null,
      responsableId: session.sub,
    },
  });

  return NextResponse.json({ center });
}
