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

// Categorías de puntos de apoyo (acopio, salud, cocinas comunitarias, etc.)
export const CATEGORIA_PUNTO_LABELS: Record<string, string> = {
  ACOPIO: "Acopio",
  SALUD: "Salud",
  COCINA: "Cocina comunitaria",
  CARGA_WIFI: "Carga / WiFi",
  SOCIAL: "Social",
  OTRO: "Otro",
};

export const CATEGORIA_PUNTO_ICONO: Record<string, string> = {
  ACOPIO: "📦",
  SALUD: "🩺",
  COCINA: "🍲",
  CARGA_WIFI: "🔌",
  SOCIAL: "🤝",
  OTRO: "📍",
};

export const CATEGORIA_PUNTO_COLOR: Record<string, string> = {
  ACOPIO: "#2563eb",
  SALUD: "#dc2626",
  COCINA: "#ea580c",
  CARGA_WIFI: "#7c3aed",
  SOCIAL: "#0d9488",
  OTRO: "#475569",
};

// Semáforo de "última confirmación" (check-in), igual al de apps
// comunitarias de respuesta a desastres: reciente / horas / sin confirmar.
export function estadoConfirmacion(ultimaConfirmacion: string | Date | null | undefined) {
  if (!ultimaConfirmacion) {
    return { label: "Sin confirmar", color: "#dc2626", key: "SIN_CONFIRMAR" as const };
  }
  const horas = (Date.now() - new Date(ultimaConfirmacion).getTime()) / 3600000;
  if (horas < 1) return { label: "Reciente (< 1 h)", color: "#16a34a", key: "RECIENTE" as const };
  if (horas < 24) return { label: `Hace ${Math.round(horas)} h`, color: "#f59e0b", key: "HORAS" as const };
  return { label: "Sin confirmar (> 24 h)", color: "#dc2626", key: "SIN_CONFIRMAR" as const };
}

// Distancia en km entre dos puntos (fórmula haversine), para mostrar
// "a X km" respecto a la ubicación del usuario.
export function distanciaKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
