import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8MB por foto

// Guarda fotos subidas por el usuario en /public/uploads.
// Nota: en un despliegue serverless (Vercel) el filesystem es efímero;
// para producción real cambia esto por un bucket (S3, R2, Cloudinary, etc.).
export async function saveUploadedPhotos(files: File[]): Promise<string[]> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    if (!ALLOWED.has(file.type)) continue;
    if (file.size > MAX_BYTES) continue;

    const ext = file.type.split("/")[1] || "jpg";
    const filename = `${uuid()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);
    urls.push(`/uploads/${filename}`);
  }
  return urls;
}
