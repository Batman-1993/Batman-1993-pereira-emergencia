"use client";

import { useEffect, useRef, useState } from "react";

export type GeocodeStatus = "idle" | "buscando" | "encontrado" | "no-encontrado";

// Busca coordenadas para una dirección con debounce, para no disparar una
// petición en cada tecla. Pensado para escritorio y celular por igual (no
// depende de eventos de mouse ni de hover).
export function useGeocode(query: string) {
  const [status, setStatus] = useState<GeocodeStatus>("idle");
  const [result, setResult] = useState<[number, number] | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 6) {
      setStatus("idle");
      return;
    }

    setStatus("buscando");
    const myId = ++requestId.current;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (myId !== requestId.current) return; // una búsqueda más reciente ya está en curso
        if (data.result) {
          setResult([data.result.lat, data.result.lng]);
          setStatus("encontrado");
        } else {
          setStatus("no-encontrado");
        }
      } catch {
        if (myId === requestId.current) setStatus("no-encontrado");
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [query]);

  return { status, result };
}
