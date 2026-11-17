import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./AppPhones.module.css";

// Deux vrais téléphones pour la section « Application mobile » :
// cadre titane champagne, bord noir, boutons, Dynamic Island, barre d'état, reflet de la vitre.

/* ---------- Le téléphone ---------- */

function StatusIcons() {
  return (
    <span className={styles.icons}>
      {/* Réseau */}
      <svg width="17" height="11" viewBox="0 0 17 11" aria-hidden="true">
        <rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" />
        <rect x="4.5" y="5" width="3" height="6" rx="1" fill="currentColor" />
        <rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="currentColor" />
        <rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor" />
      </svg>
      {/* Wi-Fi */}
      <svg width="15" height="11" viewBox="0 0 15 11" aria-hidden="true">
        <path d="M7.5 2.2c2.1 0 4 .8 5.5 2.1l1.1-1.2A9.6 9.6 0 0 0 7.5.5 9.6 9.6 0 0 0 .9 3.1L2 4.3a8 8 0 0 1 5.5-2.1Z" fill="currentColor" />
        <path d="M7.5 5.4c1.3 0 2.4.5 3.3 1.2l1.1-1.2a6.4 6.4 0 0 0-8.8 0l1.1 1.2c.9-.7 2-1.2 3.3-1.2Z" fill="currentColor" />
        <path d="M7.5 8.4c.5 0 1 .2 1.3.5L7.5 10.4 6.2 8.9c.3-.3.8-.5 1.3-.5Z" fill="currentColor" />
      </svg>
      {/* Batterie */}
      <svg width="26" height="12" viewBox="0 0 26 12" aria-hidden="true">
        <rect x="0.5" y="0.5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity="0.4" />
        <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" />
        <path d="M24 4v4c.8-.3 1.3-1.1 1.3-2S24.8 4.3 24 4Z" fill="currentColor" opacity="0.45" />
      </svg>
    </span>
  );
}

// Épaisseur du châssis : des couches empilées en profondeur, du chanfrein poli
// à la tranche en titane brossé. Vu de biais, elles forment le vrai corps du téléphone.
const DEPTH = 24;
const STEP = 1.35; // px par couche
const lerp = (a: number[], b: number[], t: number) => a.map((v, k) => Math.round(v + (b[k] - v) * t));
const hex = (c: number[]) => `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
const EDGE = Array.from({ length: DEPTH }, (_, i) => {
  const t = i / (DEPTH - 1);
  // Chanfrein clair devant, bande médiane lumineuse, arrière plus sombre.
  const light = [242, 224, 186];
  const mid = [196, 160, 98];
  const dark = [128, 92, 40];
  const c = t < 0.12 ? lerp(light, mid, t / 0.12) : t < 0.5 ? lerp(mid, [226, 200, 150], (t - 0.12) / 0.38) : lerp([226, 200, 150], dark, (t - 0.5) / 0.5);
  return hex(c);
});

function Phone({ children, light = false, className = "" }: { children: ReactNode; light?: boolean; className?: string }) {
  return (
    <div className={`${styles.device} ${className}`}>
      {/* Le corps : tranche en titane */}
      {EDGE.map((color, i) => (
        <span key={i} className={styles.slab} style={{ background: color, transform: `translateZ(${-(i + 1) * STEP}px)` }} />
      ))}
      {/* Dos du téléphone */}
      <span className={styles.rear} style={{ transform: `translateZ(${-(DEPTH + 1) * STEP}px)` }} />
      {/* Boutons en relief, à mi-épaisseur */}
      <div className={styles.keys} style={{ transform: `translateZ(${-(DEPTH / 2) * STEP}px)` }}>
        <span className={`${styles.key} ${styles.action}`} />
        <span className={`${styles.key} ${styles.volUp}`} />
        <span className={`${styles.key} ${styles.volDown}`} />
        <span className={`${styles.key} ${styles.power}`} />
      </div>
      {/* La face avant : cadre, bord noir, écran */}
      <div className={styles.face}>
        <div className={styles.bezel}>
          <div className={styles.screen}>
            <div className={`${styles.status} ${light ? styles.light : ""}`}>
              <span className={styles.time}>9:41</span>
              <StatusIcons />
            </div>
            <span className={styles.island} />
            <div className={styles.content}>{children}</div>
            <span className={styles.homeBar} />
            <span className={styles.glare} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Petites icônes d'interface ---------- */

const Ico = {
  back: <path d="M14 5l-7 7 7 7" />,
  share: (
    <>
      <path d="M12 3v12" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </>
  ),
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </>
  ),
  ring: (
    <>
      <circle cx="12" cy="14" r="6" />
      <path d="M9.5 4h5L12 7.5Z" />
    </>
  ),
  chat: <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4 3.5V16H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
};

function Icon({ name, size = 18 }: { name: keyof typeof Ico; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {Ico[name]}
    </svg>
  );
}

/* ---------- Les deux écrans ---------- */

export function AppPhones() {
  return (
    <div className={styles.stage}>
      <span className={`${styles.floor} ${styles.floorBack}`} />
      <span className={`${styles.floor} ${styles.floorFront}`} />
      {/* Derrière : le suivi du mariage */}
      <Phone className={styles.back}>
        <div className={styles.wedding}>
          <div className={styles.wTop}>
            <small>Mon mariage · 14 juin</small>
            <strong>J-210</strong>
          </div>

          <div className={styles.notif}>
            <Image src="/icons/notification-bell.png" alt="" width={26} height={26} />
            <span>
              <strong>Maison Lumen</strong>
              <small>vous a envoyé une offre révisée</small>
            </span>
          </div>
          <div className={styles.notif}>
            <Image src="/icons/calendar.png" alt="" width={26} height={26} />
            <span>
              <strong>Solde du traiteur</strong>
              <small>échéance dans 5 jours</small>
            </span>
          </div>

          <div className={styles.list}>
            <span className={styles.listTitle}>
              Checklist <em>2/3</em>
            </span>
            {["Réserver le lieu", "Choisir le photographe", "Goûter le menu"].map((t, i) => (
              <span key={t} className={i < 2 ? styles.done : ""}>
                <i />
                {t}
              </span>
            ))}
          </div>
        </div>

        <nav className={styles.tabs}>
          <span>
            <Icon name="search" size={19} />
            Explorer
          </span>
          <span>
            <Icon name="heart" size={19} />
            Favoris
          </span>
          <span className={styles.tabOn}>
            <Icon name="ring" size={19} />
            Mariage
          </span>
          <span>
            <Icon name="chat" size={19} />
            Messages
          </span>
        </nav>
      </Phone>

      {/* Devant : une fiche prestataire */}
      <Phone light className={styles.front}>
        <div className={styles.photo}>
          <Image src="/photos/kente.jpg" alt="" fill sizes="290px" style={{ objectFit: "cover", objectPosition: "50% 30%" }} />
          <div className={styles.photoBar}>
            <span className={styles.round}>
              <Icon name="back" size={16} />
            </span>
            <span className={styles.roundGroup}>
              <span className={styles.round}>
                <Icon name="share" size={15} />
              </span>
              <span className={`${styles.round} ${styles.liked}`}>
                <Icon name="heart" size={15} />
              </span>
            </span>
          </div>
          <span className={styles.count}>1 / 24</span>
        </div>

        <div className={styles.sheet}>
          <span className={styles.chip}>Vérifié</span>
          <strong className={styles.name}>Atelier Kofi & Ama</strong>
          <small className={styles.meta}>★ 5,0 · 87 avis · Paris 18e</small>
          <p className={styles.blurb}>Décor et tissus kente, du cocktail à la piste de danse.</p>

          <div className={styles.cta}>
            <span className={styles.price}>
              <small>À partir de</small>
              <strong>1 200 €</strong>
            </span>
            <span className={styles.btn}>Demander un devis</span>
          </div>
        </div>
      </Phone>
    </div>
  );
}
