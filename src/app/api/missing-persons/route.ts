import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedPhotos } from "@/lib/upload";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const estado = searchParams.get("estado");
  const ciudad = searchParams.get("ciudad");

  const persons = await prisma.missingPerson.findMany({
    where: {
      ...(estado ? { estado: estado as any } : {}),
      ...(ciudad ? { ciudad } : {}),
      ...(q
        ? {
            OR: [
              { nombreCompleto: { contains: q } },
              { identificacion: { contains: q } },
              { direccion: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ persons });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();

  const nombreCompleto = String(form.get("nombreCompleto") || "");
  const reportadoPorNombre = String(form.get("reportadoPorNombre") || "");
  const reportadoPorTelefono = String(form.get("reportadoPorTelefono") || "");
  if (!nombreCompleto || !reportadoPorNombre || !reportadoPorTelefono) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const identificacion = form.get("identificacion") ? String(form.get("identificacion")) : null;
  const edad = form.get("edad") ? parseInt(String(form.get("edad")), 10) : null;
  const genero = form.get("genero") ? String(form.get("genero")) : null;
  const direccion = form.get("direccion") ? String(form.get("direccion")) : null;
  const ciudad = String(form.get("ciudad") || "Pereira");
  const descripcion = form.get("descripcion") ? String(form.get("descripcion")) : null;
  const ultimaVezVisto = form.get("ultimaVezVisto") ? String(form.get("ultimaVezVisto")) : null;

  const foto = form.get("foto");
  let fotoUrl: string | undefined;
  if (foto instanceof File && foto.size > 0) {
    const [url] = await saveUploadedPhotos([foto]);
    fotoUrl = url;
  }

  const person = await prisma.missingPerson.create({
    data: {
      nombreCompleto,
      identificacion,
      edad,
      genero,
      direccion,
      ciudad,
      descripcion,
      ultimaVezVisto,
      fotoUrl,
      reportadoPorNombre,
      reportadoPorTelefono,
    },
  });

  return NextResponse.json({ person });
}
