import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { saveUploadedPhotos } from "@/lib/upload";
import { notifyNewReport } from "@/lib/push";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ciudad = searchParams.get("ciudad");
  const tipo = searchParams.get("tipo");
  const urgencia = searchParams.get("urgencia");
  const estado = searchParams.get("estado");

  const reports = await prisma.report.findMany({
    where: {
      ...(ciudad ? { ciudad } : {}),
      ...(tipo ? { tipo: tipo as any } : {}),
      ...(urgencia ? { urgencia: urgencia as any } : {}),
      ...(estado ? { estado: estado as any } : {}),
    },
    include: { fotos: true, _count: { select: { asignaciones: true } } },
    orderBy: [{ urgencia: "asc" }, { createdAt: "desc" }],
    take: 300,
  });

  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const form = await req.formData();

  const tipo = String(form.get("tipo") || "");
  const urgencia = String(form.get("urgencia") || "");
  const titulo = String(form.get("titulo") || "");
  const descripcion = String(form.get("descripcion") || "");
  const ciudad = String(form.get("ciudad") || "Pereira");
  const direccion = form.get("direccion") ? String(form.get("direccion")) : null;
  const lat = parseFloat(String(form.get("lat")));
  const lng = parseFloat(String(form.get("lng")));
  const personasAfectadas = form.get("personasAfectadas") ? parseInt(String(form.get("personasAfectadas")), 10) : 0;
  const contactoNombre = form.get("contactoNombre") ? String(form.get("contactoNombre")) : null;
  const contactoTelefono = form.get("contactoTelefono") ? String(form.get("contactoTelefono")) : null;

  if (!tipo || !urgencia || !titulo || !descripcion || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const files = form.getAll("fotos").filter((f): f is File => f instanceof File);
  const fotoUrls = await saveUploadedPhotos(files);

  const report = await prisma.report.create({
    data: {
      tipo: tipo as any,
      urgencia: urgencia as any,
      titulo,
      descripcion,
      ciudad,
      direccion,
      lat,
      lng,
      personasAfectadas,
      reportadoPorId: session?.sub,
      contactoNombre,
      contactoTelefono,
      fotos: { create: fotoUrls.map((url) => ({ url })) },
      statusLogs: { create: { estado: "PENDIENTE", nota: "Reporte creado", autorId: session?.sub } },
    },
    include: { fotos: true },
  });

  notifyNewReport(report).catch(() => {});

  return NextResponse.json({ report });
}
