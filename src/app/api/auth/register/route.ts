import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionCookie } from "@/lib/auth";

const schema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  telefono: z.string().optional(),
  ciudad: z.string().optional(),
  esVoluntario: z.boolean().optional(),
  especialidad: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }
  const { nombre, email, password, telefono, ciudad, esVoluntario, especialidad } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      nombre,
      email,
      passwordHash,
      telefono,
      ciudad,
      especialidad: esVoluntario ? especialidad : undefined,
      role: esVoluntario ? "VOLUNTARIO" : "CIUDADANO",
    },
  });

  await createSessionCookie({ sub: user.id, role: user.role, nombre: user.nombre });

  return NextResponse.json({ id: user.id, role: user.role });
}
