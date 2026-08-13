import Link from "next/link";
import type { SessionPayload } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

const links = [
  { href: "/", label: "Mapa" },
  { href: "/reportar", label: "Reportar" },
  { href: "/desaparecidos", label: "Desaparecidos" },
  { href: "/centros-acopio", label: "Centros de acopio" },
];

export default function NavBar({ session }: { session: SessionPayload | null }) {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-[1000]">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="font-bold text-lg flex items-center gap-2">
          🚨 Pereira Emergencia
        </Link>
        <nav className="flex items-center gap-4 text-sm flex-wrap">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:underline">
              {l.label}
            </Link>
          ))}
          {session?.role === "VOLUNTARIO" || session?.role === "ADMIN" ? (
            <Link href="/voluntarios" className="hover:underline">
              Panel voluntarios
            </Link>
          ) : null}
          {session ? (
            <>
              <span className="text-slate-300">Hola, {session.nombre}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Iniciar sesión
              </Link>
              <Link href="/registro" className="btn btn-primary !py-1.5 !px-3 text-xs">
                Crear cuenta / voluntario
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
