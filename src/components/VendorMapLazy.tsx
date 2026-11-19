"use client";

import dynamic from "next/dynamic";

// Leaflet a besoin du navigateur : la carte est chargée uniquement côté client.
const VendorMap = dynamic(() => import("./VendorMap"), {
  ssr: false,
  loading: () => <div style={{ height: "100%", background: "var(--offwhite)" }} />,
});

export function VendorMapLazy(props: { lat: number; lng: number; label: string; radiusKm?: number }) {
  return <VendorMap {...props} />;
}
