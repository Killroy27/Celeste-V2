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
                style={{ animationDuration: `${heroWords.length * STEP}s`, animationDelay: `${i * STEP - 1}s` }}
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
        <p className={styles.matchLine}>
          Pas encore d&apos;idée ? <strong>Vos prestataires idéaux en 2 minutes.</strong>
        </p>
        <Link href="/matchs" className={styles.matchBtn}>
          <Image src="/icons/match-puzzle.png" alt="" width={24} height={24} />
          Faire mon Best Match
          <ArrowIcon size={14} />
        </Link>
      </div>

      <InspirationWall />
    </section>
  );
}
