import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Faq } from "@/components/home/Sections";
import { PageIntro } from "@/components/PageIntro";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Comment ça marche",
  description: "S'inspirer, comparer les devis et réserver sereinement : tout ce que Céleste fait pour les couples.",
};

const detailed = [
  { icon: "/icons/moodboard.png", n: "1", title: "Inspirez-vous et enregistrez", text: "Parcourez les inspirations et les fiches prestataires. Un ♡ suffit pour garder un coup de cœur, retrouvé dans votre espace.", photo: "/photos/florist.jpg" },
  { icon: "/icons/match-puzzle.png", n: "2", title: "Faites votre Best Match", text: "Pas sûrs de ce que vous voulez ? Le test en quatre questions vous propose les prestataires qui correspondent à votre style et à votre budget.", photo: "/photos/field.jpg" },
  { icon: "/icons/chat-bubbles.png", n: "3", title: "Demandez et comparez les devis", text: "Une demande, plusieurs devis détaillés sous 48 h. Formules, options et prix sont présentés côte à côte, sans jargon.", photo: "/photos/chef.jpg" },
  { icon: "/icons/contract-pen.png", n: "4", title: "Réservez et payez en sécurité", text: "Contrat signé en ligne, acompte protégé sur un compte séquestré et paiement en plusieurs fois sans frais.", photo: "/photos/rings.jpg" },
];

const guarantees = [
  { icon: "/icons/verified-seal.png", title: "Prestataires vérifiés", text: "SIRET, assurance et références contrôlés avant publication." },
  { icon: "/icons/shield-lock.png", title: "Acompte protégé", text: "Versé au prestataire selon l'échéancier signé, jamais avant." },
  { icon: "/icons/five-stars.png", title: "Avis authentiques", text: "Seuls les couples ayant réservé via Céleste peuvent laisser un avis." },
  { icon: "/icons/euro-coins.png", title: "Gratuit pour les mariés", text: "Aucun frais de service, aucune commission cachée sur vos devis." },
];

export default function HowPage() {
  return (
    <>
      <PageIntro center crumbs={[["Comment ça marche"]]} title="Organiser son mariage, enfin simplement" lead="Céleste réunit les meilleurs prestataires, vos coups de cœur, vos devis et vos paiements au même endroit." />

      <div className="container">
        <ol className={styles.steps}>
          {detailed.map((s, i) => (
            <li key={s.n} className={`${styles.step} ${i % 2 ? styles.flip : ""}`}>
              <div className={styles.stepPhoto}>
                <Image src={s.photo} alt="" fill sizes="(max-width: 900px) 100vw, 560px" style={{ objectFit: "cover" }} />
              </div>
              <div className={styles.stepText}>
                <Image src={s.icon} alt="" width={72} height={72} />
                <span className="eyebrow">Étape {s.n}</span>
                <h2 className="display h2">{s.title}</h2>
                <p className="lead">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <section className="section" aria-labelledby="garanties">
        <div className="container">
          <h2 id="garanties" className="display h2" style={{ textAlign: "center" }}>
            Nos garanties
          </h2>
          <div className={styles.guarantees}>
            {guarantees.map((g) => (
              <div key={g.title} className={`card-surface ${styles.guarantee}`}>
                <Image src={g.icon} alt="" width={64} height={64} />
                <h3 className="h3">{g.title}</h3>
                <p className="muted">{g.text}</p>
              </div>
            ))}
          </div>
          <div className={styles.ctas}>
            <Link href="/matchs" className="btn">
              Trouver mon Best Match
            </Link>
            <Link href="/decouvrir" className="btn btn-outline">
              Parcourir les prestataires
            </Link>
          </div>
        </div>
      </section>

      <Faq id="faq" />
    </>
  );
}
