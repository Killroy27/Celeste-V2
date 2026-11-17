import Link from "next/link";
import styles from "./ResultsHead.module.css";

type Crumb = [label: string, href?: string];

// En-tête des pages de résultats : fil d'Ariane, titre « Métier · Lieu », une phrase.
export function ResultsHead({ crumbs, title, place, lead, narrow }: { crumbs: Crumb[]; title: string; place?: string; lead?: string; narrow?: boolean }) {
  return (
    <header className={styles.head} style={narrow ? { maxWidth: 1360 } : undefined}>
      <nav aria-label="Fil d'Ariane" className={styles.crumbs}>
        <Link href="/">Accueil</Link>
        {crumbs.map(([label, href]) => (
          <span key={label}>
            <span aria-hidden="true" className={styles.sep}>
              ›
            </span>
            {href ? <Link href={href}>{label}</Link> : <span aria-current="page">{label}</span>}
          </span>
        ))}
      </nav>
      <h1 className={styles.title}>
        {title}
        {place && <span className={styles.place}> · {place}</span>}
      </h1>
      {lead && <p className={styles.lead}>{lead}</p>}
    </header>
  );
}
