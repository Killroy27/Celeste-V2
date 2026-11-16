"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Circle, MapContainer, Marker, TileLayer } from "react-leaflet";

type Props = { lat: number; lng: number; label: string; radiusKm?: number };

// Carte réelle en couleur (OpenStreetMap), comme Fresha et Airbnb :
// l'épingle porte la note, le cercle doré montre la zone d'intervention.
export default function VendorMap({ lat, lng, label, radiusKm = 25 }: Props) {
  const pin = L.divIcon({
    className: "",
    html: `<span style="display:inline-flex;align-items:center;gap:4px;padding:7px 12px;border-radius:999px;background:#39210C;color:#fff;font:700 13px/1 var(--font-sans),system-ui,sans-serif;box-shadow:0 6px 16px rgba(57,33,12,.35);white-space:nowrap;transform:translate(-50%,-50%)">${label}</span>`,
    iconSize: [0, 0],
  });

  return (
    <MapContainer center={[lat, lng]} zoom={10} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }} attributionControl>
      {/* Tuiles OpenStreetMap standard (prototype). En production : un fournisseur de tuiles avec clé (MapTiler, Mapbox…). */}
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' maxZoom={19} />
      <Circle center={[lat, lng]} radius={radiusKm * 1000} pathOptions={{ color: "#EEB048", weight: 1.5, fillColor: "#EEB048", fillOpacity: 0.12 }} />
      <Marker position={[lat, lng]} icon={pin} />
    </MapContainer>
  );
}
