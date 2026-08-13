const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 4 * 1024 * 1024; // 4MB por foto

// Convierte las fotos subidas a data URLs (base64) guardados directamente en
// la base de datos. Es intencional: Vercel y la mayoría de hosting
// serverless tienen filesystem efímero/de solo lectura, así que escribir a
// disco (public/uploads) no sobrevive entre requests. Esto funciona en
// cualquier hosting sin depender de un bucket externo (S3, R2, Cloudinary...).
// Para producción con mucho volumen de fotos, migrar a un bucket es
// recomendable (ver README).
export async function saveUploadedPhotos(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    if (!ALLOWED.has(file.type)) continue;
    if (file.size > MAX_BYTES) continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    urls.push(`data:${file.type};base64,${buffer.toString("base64")}`);
  }
  return urls;
}
