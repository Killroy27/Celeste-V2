import type { Metadata } from "next";
import { EspaceShell } from "./EspaceShell";

export const metadata: Metadata = {
  title: { default: "Mon espace", template: "%s · Mon espace · Céleste" },
  robots: { index: false, follow: false },
};

export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  return <EspaceShell>{children}</EspaceShell>;
}
