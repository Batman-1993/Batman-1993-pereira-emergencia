import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || !["VOLUNTARIO", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const [pendientes, misAsignaciones, resueltosHoy] = await Promise.all([
    prisma.report.findMany({
      where: { estado: { in: ["PENDIENTE", "EN_ATENCION"] } },
      orderBy: [{ urgencia: "asc" }, { createdAt: "asc" }],
      take: 100,
    }),
    prisma.report.findMany({
      where: { asignaciones: { some: { voluntarioId: session.sub } }, estado: { not: "RESUELTO" } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.report.count({
      where: { estado: "RESUELTO", updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
  ]);

  return NextResponse.json({ pendientes, misAsignaciones, resueltosHoy, nombre: session.nombre });
}
