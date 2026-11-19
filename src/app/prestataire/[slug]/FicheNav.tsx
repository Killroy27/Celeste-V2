"use client";

import { useEffect, useRef, useState } from "react";
import { openContact } from "@/components/ContactCard";
import type { ActionKind } from "@/lib/vendorDetail";
import styles from "./page.module.css";

const LINKS = [
  ["prestations", "Prestations"],
  ["avis", "Avis"],
  ["portfolio", "Portfolio"],
  ["a-propos", "À propos"],
  ["lieu", "Zone"],
  ["disponibilites", "Disponibilités"],
  ["a-savoir", "À savoir"],
] as const;

// En-tête de fiche qui apparaît sous l'en-tête du site une fois les photos dépassées : ancres vers les
// sections (la section lue est soulignée) et, quand la carte de contact n'est plus à l'écran, le prix et l'action.
export function FicheNav({ price, rating, action }: { price: string; rating: string; action: { kind: ActionKind; label: string } }) {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState<string>(LINKS[0][0]);
  const [cta, setCta] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Sur mobile, les ancres défilent : la section lue reste visible dans la barre.
  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>(`a[href="#${active}"]`);
    if (nav && link && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: link.offsetLeft - nav.offsetLeft - 24, behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 80;
      const line = top + 72;
      const photos = document.getElementById("photos");
      setShown(!!photos && photos.getBoundingClientRect().bottom < top);
      // Section lue : la dernière dont le haut a passé l'en-tête (les ancres la placent à line + 8 px),
      // ou la dernière visible quand le bas de page est atteint.
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current: string = LINKS[0][0];
      for (const [id] of LINKS) {
        const r = document.getElementById(id)?.getBoundingClientRect();
        if (r && (r.top <= line + 40 || (atEnd && r.top < window.innerHeight))) current = id;
      }
      setActive(current);
      const card = document.getElementById("contact")?.getBoundingClientRect();
      setCta(!!card && (card.bottom < line || card.top > window.innerHeight));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={styles.ficheNav} data-shown={shown} aria-hidden={!shown} inert={!shown}>
      <div className={`container ${styles.ficheNavIn}`}>
        <nav ref={navRef} aria-label="Sections de la fiche" className={styles.anchors}>
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <div className={styles.navCta} data-shown={cta}>
          <span>
            <strong>dès {price}</strong>
            <small>★ {rating}</small>
          </span>
          <button type="button" className="btn btn-sm" onClick={() => openContact(action.kind)} tabIndex={cta ? 0 : -1}>
            {action.label}
          </button>
        </div>
      </div>
    </div>
  );
}
