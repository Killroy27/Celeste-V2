import Image from "next/image";
import Link from "next/link";
import { wallColumns } from "@/lib/content";
import { HeartIcon } from "./icons";
import styles from "./InspirationWall.module.css";

// Mur d'inspiration façon Pinterest : colonnes qui défilent lentement, en pause au survol.
export function InspirationWall() {
  return (
    <div className={styles.wall} aria-label="Inspirations">
      <div className={styles.grid}>
        {wallColumns.map((col, ci) => (
          <div key={ci} className={styles.colWrap} style={{ marginTop: col.offset }}>
            <div
              className={styles.col}
              style={{ animationDuration: `${col.duration}s`, animationDirection: col.reverse ? "reverse" : "normal" }}
            >
              {/* Les tuiles sont doublées pour une boucle sans à-coup ; la copie est masquée aux lecteurs d'écran. */}
              {[0, 1].map((copy) =>
                col.tiles.map((t, ti) => (
                  <Link
                    key={`${copy}-${ti}`}
                    href="/inspirations"
                    className={styles.tile}
                    style={{ height: t.h }}
                    aria-hidden={copy === 1 || undefined}
                    tabIndex={copy === 1 ? -1 : undefined}
                  >
                    <Image
                      src={t.src}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 260px"
                      style={{ objectFit: "cover", objectPosition: t.pos ?? "50% 50%" }}
                    />
                    <span className={styles.save}>
                      <HeartIcon size={17} filled={t.saved} />
                      <span className="visually-hidden">Enregistrer</span>
                    </span>
                    <span className={styles.label}>{t.label}</span>
                  </Link>
                )),
              )}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.fade} aria-hidden="true" />
    </div>
  );
}
