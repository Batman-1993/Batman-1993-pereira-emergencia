import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: {
      fotos: true,
      reportadoPor: { select: { nombre: true } },
      statusLogs: { orderBy: { createdAt: "asc" }, include: { autor: { select: { nombre: true } } } },
      asignaciones: { include: { voluntario: { select: { nombre: true, telefono: true } } } },
    },
  });
  if (!report) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ report });
}

const ROLES_QUE_ACTUALIZAN = ["VOLUNTARIO", "ADMIN"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !ROLES_QUE_ACTUALIZAN.includes(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const estado = body?.estado as string | undefined;
  const nota = body?.nota as string | undefined;
  const asignarme = Boolean(body?.asignarme);

  if (!estado) return NextResponse.json({ error: "Falta estado" }, { status: 400 });

  const report = await prisma.report.update({
    where: { id: params.id },
    data: {
      estado: estado as any,
      statusLogs: { create: { estado: estado as any, nota, autorId: session.sub } },
      ...(asignarme
        ? {
            asignaciones: {
              connectOrCreate: {
                where: { reportId_voluntarioId: { reportId: params.id, voluntarioId: session.sub } },
                create: { voluntarioId: session.sub },
              },
            },
          }
        : {}),
    },
    include: { fotos: true, statusLogs: true, asignaciones: true },
  });

  return NextResponse.json({ report });
}
