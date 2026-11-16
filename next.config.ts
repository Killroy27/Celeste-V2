import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permet de lancer un aperçu ou un build à côté d'un `next dev` déjà ouvert
  // sans écraser son dossier .next (ex. NEXT_DIST_DIR=.next-build npm run build).
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
