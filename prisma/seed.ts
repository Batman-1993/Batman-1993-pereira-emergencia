import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("voluntario123", 10);

  const voluntario = await prisma.user.upsert({
    where: { email: "voluntario@demo.co" },
    update: {},
    create: {
      nombre: "Voluntario Demo",
      email: "voluntario@demo.co",
      passwordHash,
      role: "VOLUNTARIO",
      especialidad: "Rescate en escombros",
      ciudad: "Pereira",
      telefono: "3000000000",
    },
  });

  const unaHoraAtras = new Date(Date.now() - 30 * 60 * 1000);
  const diezHorasAtras = new Date(Date.now() - 10 * 60 * 60 * 1000);

  const centro = await prisma.supportPoint.upsert({
    where: { id: "seed-centro-1" },
    update: {},
    create: {
      id: "seed-centro-1",
      nombre: "Coliseo Menor Bicentenario - Punto de acopio",
      categoria: "ACOPIO",
      ciudad: "Pereira",
      direccion: "Cra. 27 con Av. Circunvalar, Pereira",
      lat: 4.8095,
      lng: -75.6955,
      capacidad: 500,
      personasAyudadas: 120,
      responsableId: voluntario.id,
      verificado: true,
      ultimaConfirmacion: unaHoraAtras,
      inventario: {
        create: [
          { nombre: "Agua embotellada", categoria: "agua", cantidad: 400, unidad: "botellas" },
          { nombre: "Kit de aseo", categoria: "aseo", cantidad: 80, unidad: "kits" },
          { nombre: "Mercado básico", categoria: "alimentos", cantidad: 60, unidad: "paquetes" },
        ],
      },
    },
  });

  await prisma.supportPoint.upsert({
    where: { id: "seed-cocina-1" },
    update: {},
    create: {
      id: "seed-cocina-1",
      nombre: "Cocina Comunitaria Boston",
      categoria: "COCINA",
      ciudad: "Pereira",
      direccion: "Boston, Cl. 24 # 12-05, Pereira",
      lat: 4.8121,
      lng: -75.6841,
      capacidad: 180,
      personasAyudadas: 120,
      responsableId: voluntario.id,
      verificado: true,
      ultimaConfirmacion: diezHorasAtras,
      inventario: {
        create: [{ nombre: "Almuerzos servidos hoy", categoria: "alimentos", cantidad: 120, unidad: "raciones" }],
      },
    },
  });

  await prisma.supportPoint.upsert({
    where: { id: "seed-salud-1" },
    update: {},
    create: {
      id: "seed-salud-1",
      nombre: "Puesto de Salud Boston",
      categoria: "SALUD",
      ciudad: "Pereira",
      direccion: "La Churria, Cra 10 # 26-40, Pereira",
      lat: 4.8005,
      lng: -75.6889,
      capacidad: 30,
      personasAyudadas: 22,
      abierto: false,
      verificado: false,
      ultimaConfirmacion: null,
    },
  });

  await prisma.report.upsert({
    where: { id: "seed-reporte-1" },
    update: {},
    create: {
      id: "seed-reporte-1",
      tipo: "RESCATE",
      urgencia: "CRITICA",
      estado: "PENDIENTE",
      titulo: "Edificio colapsado, se escuchan voces bajo escombros",
      descripcion: "Edificio de 4 pisos parcialmente colapsado en el barrio Cuba. Vecinos reportan al menos 2 personas atrapadas.",
      ciudad: "Pereira",
      direccion: "Barrio Cuba, Pereira",
      lat: 4.7989,
      lng: -75.6822,
      personasAfectadas: 2,
      contactoNombre: "Vecino del sector",
      contactoTelefono: "3111111111",
      statusLogs: { create: { estado: "PENDIENTE", nota: "Reporte creado" } },
    },
  });

  await prisma.report.upsert({
    where: { id: "seed-reporte-2" },
    update: {},
    create: {
      id: "seed-reporte-2",
      tipo: "FALTA_AGUA",
      urgencia: "MODERADA",
      estado: "EN_ATENCION",
      titulo: "Sector sin agua potable hace 2 días",
      descripcion: "Varias cuadras del barrio Kennedy sin suministro de agua desde el terremoto.",
      ciudad: "Pereira",
      direccion: "Barrio Kennedy, Pereira",
      lat: 4.8175,
      lng: -75.6960,
      personasAfectadas: 150,
      statusLogs: {
        create: [
          { estado: "PENDIENTE", nota: "Reporte creado" },
          { estado: "EN_ATENCION", nota: "Carrotanque en camino", autorId: voluntario.id },
        ],
      },
      asignaciones: { create: { voluntarioId: voluntario.id } },
    },
  });

  await prisma.missingPerson.upsert({
    where: { id: "seed-desaparecido-1" },
    update: {},
    create: {
      id: "seed-desaparecido-1",
      nombreCompleto: "Ejemplo Demo Pérez",
      identificacion: "0000000000",
      edad: 34,
      genero: "Femenino",
      direccion: "Barrio Cuba, Pereira",
      ciudad: "Pereira",
      descripcion: "Estatura media, cabello negro. Vista por última vez cerca al edificio colapsado.",
      ultimaVezVisto: "Hoy en la mañana, barrio Cuba",
      estado: "DESAPARECIDO",
      reportadoPorNombre: "Familiar Demo",
      reportadoPorTelefono: "3122222222",
    },
  });

  console.log("Seed listo:", { voluntario: voluntario.email, centro: centro.nombre });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
