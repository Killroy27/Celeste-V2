import Image from "next/image";
import Link from "next/link";
import { heroWords } from "@/lib/content";
import { ArrowIcon } from "./icons";
import { InspirationWall } from "./InspirationWall";
import { SearchForm } from "./SearchForm";
import styles from "./Hero.module.css";

const STEP = 2.5; // secondes par mot

export function Hero() {
  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>
        <span className={styles.line} style={{ animationDelay: ".3s" }}>
          Imaginez le jour J,
        </span>
        <span className={styles.line} style={{ animationDelay: ".45s" }}>
          puis réservez votre{" "}
          {/* Les mots sont empilés dans la même cellule : un seul visible à la fois, sans saut de mise en page. */}
          <span className={styles.words} aria-hidden="true">
            {heroWords.map((w, i) => (
              <span
                key={w}
                className={styles.word}
                style={{ "--cycle": `${heroWords.length * STEP}s`, "--delay": `${i * STEP - 1}s` } as React.CSSProperties}
              >
                {w}
              </span>
            ))}
          </span>
          <span className="visually-hidden">prestataire de mariage</span>
        </span>
      </h1>

      <p className={styles.lead}>Inspirez-vous, enregistrez vos coups de cœur, demandez un devis en un clic.</p>

      <div className={styles.search}>
        <SearchForm id="hero-search" />
      </div>

      {/* L'action principale : le test Best Match. */}
      {/* Comme le « Télécharger l'app » de Fresha : une phrase, puis une pilule sobre. */}
      <div className={styles.matchs}>
        <p className={styles.matchLine}>Vous ne savez pas encore qui choisir ?</p>
        <Link href="/matchs" className={styles.matchBtn}>
          <Image src="/icons/match-puzzle.png" alt="" width={28} height={28} />
          Trouvez votre Best Match
          <span className={styles.matchGo}>
            <ArrowIcon size={14} />
          </span>
        </Link>
      </div>

      <InspirationWall />
    </section>
  );
}
