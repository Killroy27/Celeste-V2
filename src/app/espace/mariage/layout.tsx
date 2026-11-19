import { MariageNav } from "./MariageNav";

// « Mon mariage » regroupe les informations opérationnelles (CDC §5.3) : une seule entrée de navigation,
// cinq rubriques en sous-navigation plutôt que cinq entrées principales (§5.1).
export default function MariageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MariageNav />
      {children}
    </>
  );
}
