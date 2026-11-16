import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { stats } from "@/lib/content";

export const metadata: Metadata = { title: "À propos", description: "Céleste, la Maison des Célébrations : notre mission et nos engagements." };

const values = [
  { icon: "/icons/favorite-heart.png", title: "Le couple d'abord", text: "Gratuit pour les mariés, sans publicité intrusive ni revente de données." },
  { icon: "/icons/verified-seal.png", title: "La confiance", text: "Chaque prestataire est vérifié, chaque avis vient d'un couple qui a réservé." },
  { icon: "/icons/kente-cloth.png", title: "Toutes les cultures", text: "Des prestataires qui savent célébrer toutes les traditions, et les marier entre elles." },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro center crumbs={[["À propos"]]} title="La Maison des Célébrations" lead="Céleste est née d'une idée simple : organiser son mariage devrait être aussi joyeux que le jour J." />
      <div className="container" style={{ paddingBottom: 96 }}>
        <div style={{ position: "relative", aspectRatio: "16 / 7", borderRadius: 28, overflow: "hidden" }}>
          <Image src="/photos/hero.jpg" alt="Des mariés sous une arche fleurie" fill priority sizes="1280px" style={{ objectFit: "cover" }} />
        </div>
        <div style={{ maxWidth: 720, margin: "56px auto 0", display: "grid", gap: 18 }}>
          <h2 className="display h2">Notre mission</h2>
          <p className="lead">
            Trop de couples passent leurs soirées entre tableurs, e-mails sans réponse et devis impossibles à comparer. Céleste réunit les meilleurs prestataires de mariage au même endroit, avec des prix clairs, des
            devis côte à côte et des paiements sécurisés.
          </p>
          <p className="lead">
            Pour les prestataires, c&apos;est la promesse de demandes qualifiées, d&apos;outils simples pour vendre et d&apos;une vitrine à la hauteur de leur talent.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 56 }}>
          {values.map((v) => (
            <div key={v.title} className="card-surface" style={{ padding: 28, display: "grid", gap: 10 }}>
              <Image src={v.icon} alt="" width={64} height={64} />
              <h3 className="h3">{v.title}</h3>
              <p className="muted" style={{ margin: 0, lineHeight: "23px" }}>
                {v.text}
              </p>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: 56, borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          {stats.map((s) => (
            <div key={s.label} style={{ padding: "28px 16px", textAlign: "center" }}>
              <strong style={{ display: "block", fontFamily: "var(--font-display), serif", fontSize: 34 }}>{s.value}</strong>
              <span className="muted" style={{ fontSize: 14 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginTop: 48 }}>
          <Link href="/matchs" className="btn">
            Trouver mon Best Match
          </Link>
          <Link href="/contact" className="btn btn-outline">
            Nous écrire
          </Link>
        </div>
      </div>
    </>
  );
}
