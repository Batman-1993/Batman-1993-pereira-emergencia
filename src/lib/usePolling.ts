"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Vuelve a pedir `url` cada `intervalMs` para que la app se mantenga
// actualizada mientras otras personas reportan, confirman o donan, sin
// necesidad de recargar. Se pausa cuando la pestaña/pantalla no está
// visible (celular en el bolsillo) para no gastar datos ni batería, y
// retoma de inmediato al volver a primer plano.
export function usePolling<T>(url: string, intervalMs = 15000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNow = useCallback(async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as T;
      setData(json);
      setUpdatedAt(new Date());
    } catch {
      // Silencioso: si falla, se reintenta en el siguiente ciclo.
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    function stop() {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    }
    function start() {
      stop();
      timerRef.current = setInterval(fetchNow, intervalMs);
    }
    function onVisibility() {
      if (document.hidden) {
        stop();
      } else {
        fetchNow();
        start();
      }
    }

    fetchNow();
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchNow, intervalMs]);

  return { data, loading, updatedAt, refresh: fetchNow };
}
