import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const point = await prisma.supportPoint.findUnique({
    where: { id: params.id },
    include: {
      inventario: { orderBy: { nombre: "asc" } },
      donaciones: { orderBy: { createdAt: "desc" }, take: 30 },
      responsable: { select: { nombre: true, telefono: true } },
    },
  });
  if (!point) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ point });
}

// Acciones de control de ejecución: registrar personas ayudadas, confirmar
// vigencia del punto (check-in) y abrir/cerrar.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !["VOLUNTARIO", "ADMIN", "ADMIN_CENTRO"].includes(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const incremento = Number(body?.personasAyudadasIncremento || 0);
  const confirmar = Boolean(body?.confirmar);
  const abierto = typeof body?.abierto === "boolean" ? body.abierto : undefined;

  const point = await prisma.supportPoint.update({
    where: { id: params.id },
    data: {
      ...(incremento ? { personasAyudadas: { increment: incremento } } : {}),
      ...(confirmar ? { verificado: true, ultimaConfirmacion: new Date() } : {}),
      ...(abierto !== undefined ? { abierto } : {}),
    },
  });

  return NextResponse.json({ point });
}
