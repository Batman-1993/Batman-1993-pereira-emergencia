import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const person = await prisma.missingPerson.findUnique({ where: { id: params.id } });
  if (!person) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ person });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const estado = body?.estado as string | undefined;
  if (!estado) return NextResponse.json({ error: "Falta estado" }, { status: 400 });

  const person = await prisma.missingPerson.update({
    where: { id: params.id },
    data: { estado: estado as any },
  });

  return NextResponse.json({ person });
}
