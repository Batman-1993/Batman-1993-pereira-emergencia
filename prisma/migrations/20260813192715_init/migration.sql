-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "telefono" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CIUDADANO',
    "especialidad" TEXT,
    "ciudad" TEXT,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "urgencia" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL DEFAULT 'Pereira',
    "direccion" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "personasAfectadas" INTEGER DEFAULT 0,
    "reportadoPorId" TEXT,
    "contactoNombre" TEXT,
    "contactoTelefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportStatusLog" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "nota" TEXT,
    "autorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportAssignment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "voluntarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissingPerson" (
    "id" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "identificacion" TEXT,
    "edad" INTEGER,
    "genero" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT NOT NULL DEFAULT 'Pereira',
    "descripcion" TEXT,
    "ultimaVezVisto" TEXT,
    "fotoUrl" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'DESAPARECIDO',
    "reportadoPorNombre" TEXT NOT NULL,
    "reportadoPorTelefono" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissingPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportPoint" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'ACOPIO',
    "ciudad" TEXT NOT NULL DEFAULT 'Pereira',
    "direccion" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "abierto" BOOLEAN NOT NULL DEFAULT true,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "ultimaConfirmacion" TIMESTAMP(3),
    "capacidad" INTEGER,
    "personasAyudadas" INTEGER NOT NULL DEFAULT 0,
    "telefono" TEXT,
    "responsableId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "pointId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "unidad" TEXT NOT NULL DEFAULT 'unidades',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "pointId" TEXT NOT NULL,
    "donanteId" TEXT,
    "donanteNombre" TEXT,
    "item" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "unidad" TEXT NOT NULL DEFAULT 'unidades',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "ciudad" TEXT DEFAULT 'Pereira',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Report_ciudad_idx" ON "Report"("ciudad");

-- CreateIndex
CREATE INDEX "Report_urgencia_idx" ON "Report"("urgencia");

-- CreateIndex
CREATE INDEX "Report_estado_idx" ON "Report"("estado");

-- CreateIndex
CREATE INDEX "ReportStatusLog_reportId_idx" ON "ReportStatusLog"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportAssignment_reportId_voluntarioId_key" ON "ReportAssignment"("reportId", "voluntarioId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_pointId_nombre_key" ON "InventoryItem"("pointId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportadoPorId_fkey" FOREIGN KEY ("reportadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportStatusLog" ADD CONSTRAINT "ReportStatusLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportStatusLog" ADD CONSTRAINT "ReportStatusLog_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportAssignment" ADD CONSTRAINT "ReportAssignment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportAssignment" ADD CONSTRAINT "ReportAssignment_voluntarioId_fkey" FOREIGN KEY ("voluntarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportPoint" ADD CONSTRAINT "SupportPoint_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "SupportPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "SupportPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donanteId_fkey" FOREIGN KEY ("donanteId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
