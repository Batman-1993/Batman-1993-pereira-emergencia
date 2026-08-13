"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import Link from "next/link";
import { URGENCIA_COLOR, URGENCIA_LABELS, TIPO_LABELS } from "@/lib/constants";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  titulo: string;
  urgencia: keyof typeof URGENCIA_COLOR;
  tipo: keyof typeof TIPO_LABELS;
  estado: string;
  href: string;
};

// Marcador genérico (usado por puntos de apoyo: acopio, salud, cocinas...).
export type SimplePoint = {
  id: string;
  lat: number;
  lng: number;
  color: string;
  emoji?: string;
  label: string;
  sublabel?: string;
  href: string;
};

function colorIcon(color: string, emoji?: string) {
  return L.divIcon({
    className: "",
    html: emoji
      ? `<div style="background:${color};width:26px;height:26px;border-radius:50%;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1">${emoji}</div>`
      : `<div style="background:${color};width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>`,
    iconSize: [emoji ? 26 : 22, emoji ? 26 : 22],
    iconAnchor: [emoji ? 13 : 11, emoji ? 13 : 11],
  });
}

export default function MapView({
  center,
  zoom = 13,
  markers,
  points,
  onMapClick,
  pin,
  flyTo,
  height = "480px",
}: {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  points?: SimplePoint[];
  onMapClick?: (lat: number, lng: number) => void;
  pin?: [number, number] | null;
  // Cuando cambia, mueve el mapa a esta posición (ej. tras geocodificar una dirección).
  flyTo?: [number, number] | null;
  height?: string;
}) {
  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-slate-200">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onMapClick && <ClickCatcher onMapClick={onMapClick} />}
        {flyTo && <RecenterOnChange target={flyTo} />}
        {pin && (
          <Marker position={pin} icon={colorIcon("#0f172a")}>
            <Popup>Ubicación seleccionada</Popup>
          </Marker>
        )}
        {markers?.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={colorIcon(URGENCIA_COLOR[m.urgencia] || "#0f172a")}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{m.titulo}</p>
                <p>{TIPO_LABELS[m.tipo] || m.tipo}</p>
                <p>Urgencia: {URGENCIA_LABELS[m.urgencia] || m.urgencia}</p>
                <Link href={m.href} className="text-red-600 underline">
                  Ver detalle
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
        {points?.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={colorIcon(p.color, p.emoji)}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{p.label}</p>
                {p.sublabel && <p>{p.sublabel}</p>}
                <Link href={p.href} className="text-red-600 underline">
                  Ver detalle
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function ClickCatcher({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterOnChange({ target }: { target: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(target, Math.max(map.getZoom(), 16), { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target[0], target[1]]);
  return null;
}
