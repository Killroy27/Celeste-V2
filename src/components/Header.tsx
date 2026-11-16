"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MenuIcon, SearchIcon, UserIcon } from "./icons";
import { Logo } from "./Logo";
import { SearchDialog } from "./SearchDialog";
import styles from "./Header.module.css";

type Props = {
  /** id de la grande barre de recherche du hero : la pilule compacte apparaît quand elle sort de l'écran. */
  watchId?: string;
};

// En-tête sur une seule ligne. Les métiers vivent avec le catalogue, là où ils filtrent quelque chose.
export function Header({ watchId = "hero-search" }: Props) {
  const [compact, setCompact] = useState(false);
  const [raised, setRaised] = useState(false);
  const [open, setOpen] = useState(false);

  // Ombre dès qu'on quitte le haut de page.
  useEffect(() => {
    const onScroll = () => setRaised(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Comme Airbnb : quand la barre du hero passe sous l'en-tête, les liens laissent place à la pilule.
  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target) {
      setCompact(true);
      return;
    }
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const offset = header?.offsetHeight ?? 80;
    const io = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting), {
      rootMargin: `-${offset}px 0px 0px 0px`,
    });
    io.observe(target);
    return () => io.disconnect();
  }, [watchId]);

  return (
    <>
      <header data-site-header className={`${styles.header} ${raised ? styles.raised : ""}`}>
        <div className={styles.top}>
          <Link href="/" className={styles.brand} aria-label="Céleste, accueil">
            <Logo compact />
          </Link>

          <div className={`${styles.center} ${compact ? styles.isCompact : ""}`}>
            <nav className={styles.links} aria-label="Navigation principale" aria-hidden={compact} inert={compact}>
              <Link href="/decouvrir">Découvrir</Link>
              <Link href="/inspirations">Inspirations</Link>
              <Link href="/comment-ca-marche">Comment ça marche</Link>
            </nav>
            <button
              type="button"
              className={styles.pill}
              onClick={() => setOpen(true)}
              aria-hidden={!compact}
              tabIndex={compact ? 0 : -1}
              aria-label="Ouvrir la recherche"
            >
              <span className={styles.pillPart}>Prestataire</span>
              <span className={styles.pillSep} />
              <span className={styles.pillPart}>Lieu</span>
              <span className={styles.pillSep} />
              <span className={`${styles.pillPart} ${styles.pillMuted}`}>Jour J</span>
              <span className={styles.pillGo}>
                <SearchIcon size={16} />
              </span>
            </button>
          </div>

          <div className={styles.actions}>
            <Link href="/devenir-prestataire" className={styles.pro}>
              Devenir prestataire
            </Link>
            <Link href="/matchs" className={styles.cta}>
              Trouver mes matchs
            </Link>
            <button type="button" className={styles.account} aria-label="Menu du compte">
              <MenuIcon />
              <span className={styles.avatar}>
                <UserIcon />
              </span>
            </button>
          </div>
        </div>
      </header>

      <SearchDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
