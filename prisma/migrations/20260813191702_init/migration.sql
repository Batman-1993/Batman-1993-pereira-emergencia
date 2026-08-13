-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "telefono" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CIUDADANO',
    "especialidad" TEXT,
    "ciudad" TEXT,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "urgencia" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL DEFAULT 'Pereira',
    "direccion" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "personasAfectadas" INTEGER DEFAULT 0,
    "reportadoPorId" TEXT,
    "contactoNombre" TEXT,
    "contactoTelefono" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Report_reportadoPorId_fkey" FOREIGN KEY ("reportadoPorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Photo_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportStatusLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "nota" TEXT,
    "autorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportStatusLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReportStatusLog_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "voluntarioId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportAssignment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReportAssignment_voluntarioId_fkey" FOREIGN KEY ("voluntarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MissingPerson" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CollectionCenter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL DEFAULT 'Pereira',
    "direccion" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "capacidad" INTEGER,
    "personasAyudadas" INTEGER NOT NULL DEFAULT 0,
    "telefono" TEXT,
    "responsableId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollectionCenter_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "unidad" TEXT NOT NULL DEFAULT 'unidades',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "CollectionCenter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "donanteId" TEXT,
    "donanteNombre" TEXT,
    "item" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "unidad" TEXT NOT NULL DEFAULT 'unidades',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Donation_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "CollectionCenter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Donation_donanteId_fkey" FOREIGN KEY ("donanteId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "ciudad" TEXT DEFAULT 'Pereira',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
CREATE UNIQUE INDEX "InventoryItem_centerId_nombre_key" ON "InventoryItem"("centerId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
