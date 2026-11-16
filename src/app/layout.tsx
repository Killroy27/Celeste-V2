import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, DM_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
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
  themeColor: "#FBF7F2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable}`}>
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
