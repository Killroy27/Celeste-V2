import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, DM_Sans } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Céleste · La Maison des Célébrations",
  description:
    "Inspirez-vous, enregistrez vos coups de cœur et demandez un devis en un clic aux meilleurs prestataires de mariage.",
};

export const viewport: Viewport = {
  themeColor: "#FBF7F2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
