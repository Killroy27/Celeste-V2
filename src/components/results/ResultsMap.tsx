"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

export type Pin = { slug: string; lat: number; lng: number; price: string };

type Props = { pins: Pin[]; active: string | null; selected: string | null; onSelect: (slug: string | null) => void; onHover: (slug: string | null) => void };

const pill = (price: string, state: "idle" | "hover" | "selected") => {
  const dark = state !== "idle";
  return L.divIcon({
    className: "",
    html: `<span style="display:inline-flex;align-items:center;height:30px;padding:0 11px;border-radius:999px;background:${dark ? "#000" : "#fff"};color:${dark ? "#fff" : "#000"};font:500 13px/1 var(--font-sans),system-ui,sans-serif;box-shadow:0 0 0 1px rgba(0,0,0,.06),0 3px 10px rgba(0,0,0,.18);white-space:nowrap;transform:translate(-50%,-50%) scale(${state === "idle" ? 1 : 1.08});transition:transform .15s">${price}</span>`,
    iconSize: [0, 0],
  });
};

function Fit({ pins }: { pins: Pin[] }) {
  const map = useMap();
  const key = pins.map((p) => p.slug).join();
  useEffect(() => {
    if (!pins.length) return;
    if (pins.length === 1) map.setView([pins[0].lat, pins[0].lng], 12);
    else map.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng])), { padding: [48, 48], maxZoom: 13 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  useEffect(() => {
    // La carte peut changer de taille (bascule liste / carte sur mobile).
    const t = setTimeout(() => map.invalidateSize(), 60);
    return () => clearTimeout(t);
  });
  return null;
}

// Carte des résultats : une pastille de prix par prestataire localisé, comme Airbnb.
export default function ResultsMap({ pins, active, selected, onSelect, onHover }: Props) {
  const icons = useMemo(() => new Map(pins.map((p) => [p.slug, { idle: pill(p.price, "idle"), hover: pill(p.price, "hover"), selected: pill(p.price, "selected") }])), [pins]);
  return (
    <MapContainer className="celeste-map" center={[48.8566, 2.3522]} zoom={11} scrollWheelZoom style={{ height: "100%", width: "100%" }} zoomControl={false}>
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' maxZoom={19} />
      <Fit pins={pins} />
      {pins.map((p) => {
        const state = selected === p.slug ? "selected" : active === p.slug ? "hover" : "idle";
        return (
          <Marker
            key={p.slug}
            position={[p.lat, p.lng]}
            icon={icons.get(p.slug)![state]}
            zIndexOffset={state === "idle" ? 0 : 1000}
            eventHandlers={{
              click: () => onSelect(p.slug),
              mouseover: () => onHover(p.slug),
              mouseout: () => onHover(null),
            }}
          />
        );
      })}
    </MapContainer>
  );
}
