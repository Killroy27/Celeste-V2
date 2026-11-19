"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Circle, MapContainer, Marker, TileLayer } from "react-leaflet";

type Props = { lat: number; lng: number; label: string; radiusKm?: number };

// Carte réelle en couleur (OpenStreetMap), comme Fresha et Airbnb :
// l'épingle porte la note, le cercle montre la zone d'intervention.
export default function VendorMap({ lat, lng, label, radiusKm = 25 }: Props) {
  const pin = L.divIcon({
    className: "",
    html: `<span style="display:inline-flex;align-items:center;gap:4px;padding:7px 12px;border-radius:999px;background:#000;color:#fff;font:500 13px/1 var(--font-sans),system-ui,sans-serif;box-shadow:0 6px 16px rgba(0,0,0,.25);white-space:nowrap;transform:translate(-50%,-50%)">${label}</span>`,
    iconSize: [0, 0],
  });

  return (
    <MapContainer className="celeste-map" center={[lat, lng]} zoom={10} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }} attributionControl>
      {/* Tuiles OpenStreetMap désaturées par la classe celeste-map (prototype). En production : un fournisseur sous licence avec style clair (MapTiler, Mapbox…). */}
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' maxZoom={19} />
      <Circle center={[lat, lng]} radius={radiusKm * 1000} pathOptions={{ color: "#000000", weight: 1, fillColor: "#000000", fillOpacity: 0.05 }} />
      <Marker position={[lat, lng]} icon={pin} />
    </MapContainer>
  );
}
