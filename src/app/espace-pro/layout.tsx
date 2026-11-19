import type { Metadata } from "next";
import { ProShell } from "./ProShell";

export const metadata: Metadata = {
  title: { default: "Espace prestataire", template: "%s · Espace prestataire · Céleste" },
  robots: { index: false, follow: false },
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return <ProShell>{children}</ProShell>;
}
