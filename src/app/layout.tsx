import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

// Roobert PRO : police unique du site (docs/direction-artistique.md §4). Pas de graisse 600 ni d'italique.
const roobert = localFont({
  src: [
    { path: "../fonts/roobert/RoobertPRO-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/roobert/RoobertPRO-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/roobert/RoobertPRO-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/roobert/RoobertPRO-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-roobert",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://celeste.example"),
  title: {
    default: "Céleste · La Maison des Célébrations",
    template: "%s · Céleste",
  },
  description:
    "Inspirez-vous, enregistrez vos coups de cœur et demandez un devis en un clic aux meilleurs prestataires de mariage.",
  openGraph: { type: "website", locale: "fr_FR", siteName: "Céleste", images: ["/photos/hero.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={roobert.variable}>
      <body>
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <Header />
        <main id="contenu">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
