"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
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

function colorIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export default function MapView({
  center,
  zoom = 13,
  markers,
  onMapClick,
  pin,
  height = "480px",
}: {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  onMapClick?: (lat: number, lng: number) => void;
  pin?: [number, number] | null;
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
