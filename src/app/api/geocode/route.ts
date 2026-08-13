import { NextRequest, NextResponse } from "next/server";

// Geocodificación de direcciones a coordenadas usando Nominatim (OpenStreetMap),
// gratis y sin API key. Se llama desde el servidor (no el navegador) porque
// Nominatim exige identificar la app con un User-Agent válido, algo que no se
// puede fijar desde fetch() en el cliente.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 4) {
    return NextResponse.json({ result: null });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", q);
  url.searchParams.set("countrycodes", "co");
  url.searchParams.set("limit", "1");
  url.searchParams.set("accept-language", "es");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        // Nominatim's usage policy requires identifying the application.
        "User-Agent": "PereiraEmergencia/1.0 (contacto: projects@allinagencymarketing.com)",
      },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ result: null });

    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    const first = data[0];
    if (!first) return NextResponse.json({ result: null });

    return NextResponse.json({
      result: { lat: parseFloat(first.lat), lng: parseFloat(first.lon), label: first.display_name },
    });
  } catch {
    return NextResponse.json({ result: null });
  }
}
