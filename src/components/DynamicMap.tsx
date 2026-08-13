"use client";

import dynamic from "next/dynamic";

// Leaflet toca `window`, así que el mapa solo puede renderizarse en el cliente.
const DynamicMap = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-slate-200 bg-slate-100 animate-pulse" style={{ height: "480px" }} />
  ),
});

export default DynamicMap;
