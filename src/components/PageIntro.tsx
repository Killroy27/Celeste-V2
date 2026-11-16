import Link from "next/link";
import styles from "./PageIntro.module.css";

type Crumb = [label: string, href?: string];

// En-tête de page commun : fil d'Ariane, titre en Bodoni, chapô.
export function PageIntro({ crumbs, title, lead, center, children }: { crumbs?: Crumb[]; title: React.ReactNode; lead?: string; center?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`container ${styles.intro} ${center ? styles.center : ""}`}>
      {crumbs && (
        <nav aria-label="Fil d'Ariane" className={styles.crumbs}>
          <Link href="/">Accueil</Link>
          {crumbs.map(([label, href]) => (
            <span key={label}>
              <span aria-hidden="true">/</span>
              {href ? <Link href={href}>{label}</Link> : <span aria-current="page">{label}</span>}
            </span>
          ))}
        </nav>
      )}
      <h1 className="display h1">{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </div>
  );
}
