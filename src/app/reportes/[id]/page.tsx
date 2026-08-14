import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import ReportDetailClient from "@/components/ReportDetailClient";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const [report, session] = await Promise.all([
    prisma.report.findUnique({
      where: { id: params.id },
      include: {
        fotos: true,
        reportadoPor: { select: { nombre: true } },
        statusLogs: { orderBy: { createdAt: "asc" }, include: { autor: { select: { nombre: true } } } },
        asignaciones: { include: { voluntario: { select: { nombre: true, telefono: true } } } },
      },
    }),
    getSession(),
  ]);

  if (!report) notFound();

  const puedeGestionar = !!session && ["VOLUNTARIO", "ADMIN"].includes(session.role);

  return (
    <ReportDetailClient
      reportId={report.id}
      initialReport={report as any}
      puedeGestionar={puedeGestionar}
      estaLogueado={!!session}
    />
  );
}
