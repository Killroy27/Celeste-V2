import type { Metadata } from "next";
import Image from "next/image";
import { HeartIcon, SearchIcon } from "@/components/icons";
import styles from "./charte.module.css";

// Charte vivante « Éditorial chaleureux » (docs/direction-artistique.md).
// Les tokens viennent de src/app/globals.css : la charte montre exactement ce que le site utilise.

export const metadata: Metadata = {
  title: "Charte graphique",
  description: "Direction artistique de Céleste : couleurs, typographie, composants et statuts.",
  robots: { index: false, follow: false },
};

const palette = [
  { name: "Blanc", hex: "#ffffff", role: "Fond général, cartes, panneaux", cls: styles.swWhite },
  { name: "Blanc cassé", hex: "#fbf7f2", role: "Surface secondaire légère : sections alternées, états vides", cls: styles.swOffwhite },
  { name: "Noir", hex: "#000000", role: "Texte, icônes, action principale", cls: styles.swInk },
  { name: "Jaune", hex: "#eeb048", role: "Signature : Best Match, score, Select", cls: styles.swBrand },
];

const derived = [
  ["--ink-2", "#4d4d4d", "Texte secondaire · 7,9:1"],
  ["--ink-3", "#6e6e6e", "Métadonnées · 4,7:1"],
  ["--line", "#ebebeb", "Séparateurs"],
  ["--line-strong", "rgba(0,0,0,.18)", "Contours de champs"],
  ["--hover", "rgba(0,0,0,.04)", "Survol des surfaces"],
] as const;

const type = [
  { label: "Display · Roobert Medium · 76/80", cls: styles.tDisplay, text: "Votre mariage, enfin simple" },
  { label: "Titre de page · Roobert Medium · 52/56", cls: styles.tH1, text: "Photographes à Paris" },
  { label: "Titre de section · Roobert Medium · 28/34", cls: styles.tH2, text: "Vos meilleurs matchs" },
  { label: "Titre de carte · Roobert Medium · 18/24", cls: styles.tH3, text: "Studio Aube" },
  { label: "Corps · Roobert Regular · 16/26", cls: styles.tBody, text: "Céleste comprend votre projet et vous présente les prestataires qui vous correspondent vraiment, avec les raisons de chaque recommandation." },
  { label: "Petit · Roobert Regular · 14/20", cls: styles.tSmall, text: "Paris 11e · Reportage · répond en moins de 2 h" },
  { label: "Surtitre · Roobert Medium · 12/16", cls: styles.tEyebrow, text: "Best Match · 2 minutes" },
];

type Tone = "pos" | "wait" | "neg" | "neutral" | "active";
const statuses: { group: string; items: [string, Tone][] }[] = [
  { group: "Offres (CDC §11.2)", items: [["Brouillon", "neutral"], ["Envoyée", "active"], ["Vue", "wait"], ["En discussion", "wait"], ["Nouvelle version", "active"], ["Acceptée", "pos"], ["Réservation confirmée", "pos"], ["Refusée", "neg"], ["Expirée", "neutral"], ["Retirée", "neutral"]] },
  { group: "Visites (CDC §12)", items: [["Demandée", "active"], ["Acceptée", "pos"], ["Créneau alternatif proposé", "wait"], ["Refusée", "neg"]] },
  { group: "Paiements (CDC §14)", items: [["Payé", "pos"], ["Paiement à venir", "wait"], ["Paiement échoué", "neg"], ["Remboursé", "neutral"]] },
  { group: "Disponibilité (CDC §17)", items: [["Disponible confirmé", "pos"], ["Probablement disponible", "wait"], ["À confirmer", "wait"], ["Capacité limitée", "wait"], ["Complet", "neg"]] },
];

const toneCls: Record<Tone, string> = { pos: styles.sPos, wait: styles.sWait, neg: styles.sNeg, neutral: styles.sNeutral, active: styles.sActive };

function Section({ id, eyebrow, title, lead, children }: { id: string; eyebrow: string; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-t`}>
      <header className={styles.sectionHead}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 id={`${id}-t`} className={styles.sectionTitle}>
          {title}
        </h2>
        {lead && <p className={styles.sectionLead}>{lead}</p>}
      </header>
      {children}
    </section>
  );
}

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ChartePage() {
  return (
    <div className={styles.root}>
      {/* ---------- Ouverture ---------- */}
      <div className={styles.hero}>
        <div className={styles.wrap}>
          <span className={styles.eyebrow}>Direction artistique · mise à jour le 17/11/2026</span>
          <h1 className={styles.tDisplay}>Éditorial chaleureux</h1>
          <p className={styles.heroLead}>La structure d&apos;Airbnb, la clarté de Fresha, l&apos;émotion d&apos;un magazine de mariage.</p>
          <nav className={styles.toc} aria-label="Sommaire de la charte">
            {[
              ["couleurs", "Couleurs"],
              ["typo", "Typographie"],
              ["boutons", "Boutons"],
              ["badges", "Badges"],
              ["statuts", "Statuts"],
              ["cartes", "Cartes"],
              ["formes", "Formes"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className={styles.wrap}>
        {/* ---------- Couleurs ---------- */}
        <Section id="couleurs" eyebrow="01" title="Couleurs" lead="Le blanc domine pour un rendu lumineux et festif. Le noir porte l'action, le jaune signe ce qui n'appartient qu'à Céleste.">
          <div className={styles.palette}>
            {palette.map((c) => (
              <div key={c.hex} className={styles.swatch}>
                <div className={`${styles.swatchChip} ${c.cls}`} />
                <div className={styles.swatchMeta}>
                  <strong>{c.name}</strong>
                  <code>{c.hex}</code>
                  <span>{c.role}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.derived}>
            {derived.map(([token, value, role]) => (
              <div key={token} className={styles.derivedRow}>
                <span className={styles.derivedDot} style={{ background: value }} />
                <code>{token}</code>
                <code className={styles.muted}>{value}</code>
                <span className={styles.muted}>{role}</span>
              </div>
            ))}
          </div>
          <div className={styles.rules}>
            <div className={styles.ruleOk}>
              <span className={styles.ruleTag}>À faire</span>
              <div className={styles.ruleDemo}>
                <span className={styles.brandBlock}>Texte noir sur jaune · 10,3:1</span>
              </div>
            </div>
            <div className={styles.ruleNo}>
              <span className={styles.ruleTag}>À éviter</span>
              <div className={styles.ruleDemo}>
                <span className={styles.brandText}>Texte jaune sur clair · 1,9:1</span>
              </div>
            </div>
            <div className={styles.ruleNo}>
              <span className={styles.ruleTag}>À éviter</span>
              <div className={styles.ruleDemo}>
                <span className={styles.brandBlock}>Jaune</span>
                <span className={styles.brandBlock}>partout</span>
                <span className={styles.brandBlock}>à la fois</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ---------- Typographie ---------- */}
        <Section id="typo" eyebrow="02" title="Typographie" lead="Une seule famille, Roobert : Medium pour les titres et les actions, Regular pour la lecture, Light pour les chapôs.">
          <div className={styles.typeList}>
            {type.map((t) => (
              <div key={t.label} className={styles.typeRow}>
                <span className={styles.typeLabel}>{t.label}</span>
                <p className={t.cls}>{t.text}</p>
              </div>
            ))}
            <div className={styles.typeRow}>
              <span className={styles.typeLabel}>Grand chiffre · Roobert Medium · 40/44</span>
              <div className={styles.numbers}>
                <span className={styles.tNumber}>650 €</span>
                <span className={styles.tNumber}>92 %</span>
                <span className={styles.tNumber}>J-214</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ---------- Boutons ---------- */}
        <Section id="boutons" eyebrow="03" title="Boutons" lead="Un bouton principal noir et, au plus, un bouton signature jaune par écran.">
          <div className={styles.btnGrid}>
            <div className={styles.btnCell}>
              <button type="button" className={styles.btnPrimary}>
                Envoyer la demande
              </button>
              <p>
                <strong>Principal</strong> · Envoyer, Réserver, Payer, Accepter
              </p>
            </div>
            <div className={styles.btnCell}>
              <button type="button" className={styles.btnSignature}>
                <span aria-hidden="true">✦</span> Trouver mes matchs
              </button>
              <p>
                <strong>Signature</strong> · Best Match uniquement
              </p>
            </div>
            <div className={styles.btnCell}>
              <button type="button" className={styles.btnSecondary}>
                Proposer un rendez-vous
              </button>
              <p>
                <strong>Secondaire</strong> · alternatives
              </p>
            </div>
            <div className={styles.btnCell}>
              <button type="button" className={styles.btnLink}>
                Voir les 132 avis
              </button>
              <p>
                <strong>Discret</strong> · navigation tertiaire
              </p>
            </div>
          </div>
          <div className={styles.btnSizes}>
            <button type="button" className={`${styles.btnPrimary} ${styles.btnSm}`}>
              Petit · 36
            </button>
            <button type="button" className={styles.btnPrimary}>
              Standard · 48
            </button>
            <button type="button" className={`${styles.btnPrimary} ${styles.btnLg}`}>
              Grand · 56
            </button>
            <button type="button" className={styles.btnPrimary} disabled>
              Désactivé
            </button>
          </div>

          <div className={styles.headerDemo} aria-hidden="true">
            <span className={styles.headerLogo}>Céleste</span>
            <span className={styles.headerNav}>
              <span>Découvrir</span>
              <span>Inspirations</span>
              <span>Comment ça marche</span>
            </span>
            <span className={styles.headerActions}>
              <span className={styles.btnLink}>Devenir prestataire</span>
              <span className={`${styles.btnSignature} ${styles.btnSm}`}>✦ Trouver mes matchs</span>
            </span>
          </div>
          <p className={styles.caption}>En-tête cible : une seule action mise en avant, « Devenir prestataire » en lien texte.</p>

          <div className={styles.fieldDemo}>
            <div className={styles.search}>
              <div className={styles.searchPart}>
                <span>Prestataire</span>
                <strong>Photographe</strong>
              </div>
              <div className={styles.searchPart}>
                <span>Lieu</span>
                <strong>Paris</strong>
              </div>
              <div className={styles.searchPart}>
                <span>Date</span>
                <em>Jour J</em>
              </div>
              <span className={styles.searchGo}>
                <SearchIcon size={18} />
              </span>
            </div>
            <div className={styles.chips}>
              <span className={`${styles.chip} ${styles.chipOn}`}>Reportage</span>
              <span className={styles.chip}>Champêtre</span>
              <span className={styles.chip}>Moins de 2 000 €</span>
              <span className={styles.chip}>Disponible le 12 juin</span>
            </div>
          </div>
          <p className={styles.caption}>La loupe passe au noir : le jaune reste au Best Match.</p>
        </Section>

        {/* ---------- Badges ---------- */}
        <Section id="badges" eyebrow="04" title="Badges de confiance" lead="Vérifié constate une identité. Select se mérite et c'est le seul badge qui porte du jaune.">
          <div className={styles.badgeRow}>
            <div className={styles.badgeCell}>
              <span className={styles.badgeVerified}>
                <Check /> Vérifié
              </span>
              <p>Identité et entreprise contrôlées (§18.1)</p>
            </div>
            <div className={styles.badgeCell}>
              <span className={styles.badgeSelect}>
                <span className={styles.diamond} aria-hidden="true" /> Céleste Select
              </span>
              <p>Performance réelle, ne s&apos;achète pas (§18.2)</p>
            </div>
            <div className={styles.badgeCell}>
              <span className={styles.badgeScore}>
                <span aria-hidden="true">✦</span> 92 % compatible
              </span>
              <p>Toujours suivi de « Pourquoi ce match » (§7.5)</p>
            </div>
          </div>
        </Section>

        {/* ---------- Statuts ---------- */}
        <Section id="statuts" eyebrow="05" title="Statuts" lead="Un point et un libellé, jamais la couleur seule. Seule exception à la charte, réservée aux espaces connectés.">
          <div className={styles.statusGroups}>
            {statuses.map((g) => (
              <div key={g.group} className={styles.statusGroup}>
                <h3 className={styles.statusTitle}>{g.group}</h3>
                <div className={styles.statusList}>
                  {g.items.map(([label, tone]) => (
                    <span key={label} className={`${styles.status} ${toneCls[tone]}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------- Cartes ---------- */}
        <Section id="cartes" eyebrow="06" title="Cartes" lead="La photo d'abord, une hiérarchie courte, le prix en gras. En mode Best Match, le score remplace le badge.">
          <div className={styles.cards}>
            <article className={styles.vendor}>
              <div className={styles.vendorMedia}>
                <Image src="/photos/confetti.jpg" alt="" fill sizes="320px" style={{ objectFit: "cover" }} />
                <span className={`${styles.badgeVerified} ${styles.onPhoto}`}>
                  <Check /> Vérifié
                </span>
                <span className={styles.heart}>
                  <HeartIcon size={18} />
                </span>
                <span className={styles.dots} aria-hidden="true">
                  <i className={styles.dotOn} />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <div className={styles.vendorBody}>
                <div className={styles.vendorLine}>
                  <h3 className={styles.tH3}>Studio Aube</h3>
                  <span className={styles.rating}>★ 4,9 (132)</span>
                </div>
                <p className={styles.tSmallMuted}>Paris 11e · Reportage</p>
                <p className={styles.tSmall}>
                  dès <strong>650 €</strong>
                </p>
              </div>
            </article>

            <article className={styles.vendor}>
              <div className={styles.vendorMedia}>
                <Image src="/photos/field.jpg" alt="" fill sizes="320px" style={{ objectFit: "cover" }} />
                <span className={`${styles.badgeScore} ${styles.onPhoto}`}>
                  <span aria-hidden="true">✦</span> 92 %
                </span>
                <span className={styles.heart}>
                  <HeartIcon size={18} />
                </span>
              </div>
              <div className={styles.vendorBody}>
                <div className={styles.vendorLine}>
                  <h3 className={styles.tH3}>Maison Lumen</h3>
                  <span className={styles.rating}>★ 4,8 (64)</span>
                </div>
                <p className={styles.tSmallMuted}>Paris 5e · Champêtre</p>
                <p className={styles.tSmall}>
                  dès <strong>590 €</strong>
                </p>
              </div>
            </article>

            <article className={styles.matchCard}>
              <div className={styles.matchHead}>
                <span className={styles.tNumber}>92 %</span>
                <span className={styles.badgeSelect}>
                  <span className={styles.diamond} aria-hidden="true" /> Select
                </span>
              </div>
              <h3 className={styles.tH3}>Pourquoi ce match</h3>
              <ul className={styles.reasons}>
                <li>Style champêtre, comme le vôtre</li>
                <li>Disponible à votre période</li>
                <li>Dans votre budget</li>
              </ul>
              <p className={styles.gap}>Écart : se déplace hors Île-de-France sur demande</p>
              <div className={styles.matchFoot}>
                <span className={`${styles.status} ${styles.sPos}`}>Confiance élevée</span>
                <button type="button" className={`${styles.btnPrimary} ${styles.btnSm}`}>
                  Voir la fiche
                </button>
              </div>
            </article>

            <article className={styles.empty}>
              <Image src="/icons/favorite-heart.png" alt="" width={72} height={72} />
              <h3 className={styles.tH3}>Aucun coup de cœur pour l&apos;instant</h3>
              <p className={styles.tSmallMuted}>Touchez ♡ sur une fiche pour la garder ici et comparer plus tard.</p>
              <button type="button" className={`${styles.btnSecondary} ${styles.btnSm}`}>
                Parcourir les photographes
              </button>
            </article>
          </div>
          <p className={styles.caption}>Dernière carte : un état vide utile, avec une phrase et une seule action (CDC §27).</p>
        </Section>

        {/* ---------- Formes ---------- */}
        <Section id="formes" eyebrow="07" title="Formes et élévation" lead="Rayons sur une échelle courte, ombres en noir pur, jamais teintées.">
          <div className={styles.radii}>
            {[8, 12, 16, 24, 999].map((r) => (
              <div key={r} className={styles.radiusCell}>
                <div className={styles.radiusBox} style={{ borderRadius: r }} />
                <span>{r === 999 ? "Pilule" : `${r} px`}</span>
              </div>
            ))}
          </div>
          <div className={styles.shadows}>
            {[
              ["--shadow-1", "Cartes au repos", styles.sh1],
              ["--shadow-2", "Survol, menus, réservation", styles.sh2],
              ["--shadow-3", "Modales", styles.sh3],
            ].map(([token, role, cls]) => (
              <div key={token} className={`${styles.shadowBox} ${cls}`}>
                <code>{token}</code>
                <span>{role}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
