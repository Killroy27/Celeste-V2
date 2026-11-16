import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container" style={{ padding: "96px var(--gutter)", display: "grid", justifyItems: "center", gap: 14, textAlign: "center" }}>
      <Image src="/icons/magnifier.png" alt="" width={96} height={96} />
      <h1 className="display h2">Cette page s&apos;est éclipsée avant le dessert</h1>
      <p className="lead">Elle a peut-être changé d&apos;adresse. Reprenons depuis l&apos;accueil.</p>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
        <Link href="/" className="btn">
          Retour à l&apos;accueil
        </Link>
        <Link href="/decouvrir" className="btn btn-outline">
          Découvrir les prestataires
        </Link>
      </div>
    </div>
  );
}
