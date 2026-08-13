import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import RegisterSW from "@/components/RegisterSW";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Pereira Emergencia",
  description: "Reporte y coordinación de emergencias tras el terremoto en Pereira y Risaralda",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="es">
      <body>
        <RegisterSW />
        <NavBar session={session} />
        <main className="max-w-5xl mx-auto px-4 pb-16 pt-4">{children}</main>
      </body>
    </html>
  );
}
