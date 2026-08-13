// Ciudades de Risaralda cubiertas inicialmente. El modelo de datos no está
// atado a esta lista: cualquier ciudad puede reportarse por texto libre,
// esto solo se usa para centrar el mapa y ofrecer accesos rápidos.
export const CIUDADES = [
  { nombre: "Pereira", lat: 4.8087, lng: -75.6906 },
  { nombre: "Dosquebradas", lat: 4.8357, lng: -75.6704 },
  { nombre: "Santa Rosa de Cabal", lat: 4.8694, lng: -75.6222 },
  { nombre: "La Virginia", lat: 4.8994, lng: -75.8811 },
  { nombre: "Marsella", lat: 4.9367, lng: -75.7394 },
  { nombre: "Cartago", lat: 4.7461, lng: -75.9107 },
] as const;

export function ciudadCoords(nombre: string) {
  return CIUDADES.find((c) => c.nombre.toLowerCase() === nombre.toLowerCase()) ?? CIUDADES[0];
}

export const TIPO_LABELS: Record<string, string> = {
  RESCATE: "Ayuda para sacar a alguien",
  ESTRUCTURA_RIESGO: "Edificio en riesgo de caerse",
  FALTA_AGUA: "Falta de agua",
  FALTA_ALIMENTOS: "Falta de alimentos",
  OTRO: "Otro daño / reporte",
};

export const URGENCIA_LABELS: Record<string, string> = {
  CRITICA: "Crítica (riesgo de vida)",
  MODERADA: "Moderada",
  LEVE: "Leve",
};

// Colores estilo semáforo. Se usa color + texto/ícono siempre (no solo color)
// para que sea legible también para personas con daltonismo.
export const URGENCIA_COLOR: Record<string, string> = {
  CRITICA: "#dc2626",
  MODERADA: "#f59e0b",
  LEVE: "#16a34a",
};

export const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_ATENCION: "En atención",
  RESUELTO: "Resuelto",
  DESCARTADO: "Descartado",
};

export const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE: "#dc2626",
  EN_ATENCION: "#f59e0b",
  RESUELTO: "#16a34a",
  DESCARTADO: "#6b7280",
};

export const ESTADO_PERSONA_LABELS: Record<string, string> = {
  DESAPARECIDO: "Desaparecido/a",
  ENCONTRADO_VIVO: "Encontrado/a con vida",
  ENCONTRADO_FALLECIDO: "Encontrado/a fallecido/a",
};

export const ESTADO_PERSONA_COLOR: Record<string, string> = {
  DESAPARECIDO: "#dc2626",
  ENCONTRADO_VIVO: "#16a34a",
  ENCONTRADO_FALLECIDO: "#6b7280",
};
