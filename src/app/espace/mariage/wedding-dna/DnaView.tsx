"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { stamp } from "@/lib/format";
import { loadDna, saveDna } from "@/lib/dna";
import { ambiances, mustOptions, priorities, seasons, summarize, zones, type Dna } from "@/lib/match";
import { euros, useWedding } from "@/lib/wedding";
import styles from "../../espace.module.css";
import d from "./dna.module.css";

// Wedding DNA (CDC §6) : profil vivant du mariage, issu du moodboard. Les tags tirés des inspirations
// restent visibles et corrigibles par le couple (§6.2) ; toute modification relance les recommandations (§6.3).
export function DnaView() {
  const { wedding: w } = useWedding();
  const [dna, setDna] = useState<Dna | null>(null);
  const [ready, setReady] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [editing, setEditing] = useState<{ tag: string; value: string } | null>(null);
  const [analysing, setAnalysing] = useState<string[]>([]);

  useEffect(() => {
    setDna(loadDna());
    setReady(true);
  }, []);

  if (!w || !ready) return null;

  if (!dna) {
    return (
      <div className={styles.empty}>
        <Image src="/icons/moodboard.png" alt="" width={88} height={88} />
        <h1 className={styles.sectionTitle}>Votre Wedding DNA n&apos;existe pas encore</h1>
        <p>Quelques images et quelques curseurs : Céleste comprend votre mariage et vous recommande les prestataires qui vous ressemblent.</p>
        <Link href="/matchs" className="btn btn-signature btn-sm">
          ✦ Créer mon Wedding DNA
        </Link>
      </div>
    );
  }

  const save = (next: Dna) => {
    saveDna(next);
    setDna(next);
  };
  const removeTag = (tag: string) => save({ ...dna, tags: dna.tags.filter((t) => t !== tag) });
  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (tag && !dna.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) save({ ...dna, tags: [...dna.tags, tag] });
  };
  const renameTag = (from: string, to: string) => {
    const tag = to.trim();
    if (tag && tag !== from) save({ ...dna, tags: [...new Set(dna.tags.map((t) => (t === from ? tag : t)))] });
    setEditing(null);
  };

  // Analyse des images importées (simulée) : l'IA propose des tags, le couple les corrige (§6.2).
  // En production, l'image est envoyée au service d'analyse ; ici, seuls le nom et des tags d'exemple sont gardés.
  const analyse = (files: File[]) => {
    const names = files.map((f) => f.name);
    setAnalysing(names);
    setTimeout(() => {
      const styles = ambiances.flatMap((a) => a.styles);
      const proposed = names.map((name) => {
        const h = [...name].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
        return { name, tags: [styles[h % styles.length], styles[(h >> 3) % styles.length]].filter((t, i, arr) => arr.indexOf(t) === i) };
      });
      const cur = loadDna() ?? dna;
      save({ ...cur, uploads: [...(cur.uploads ?? []), ...proposed], tags: [...new Set([...cur.tags, ...proposed.flatMap((p) => p.tags)])] });
      setAnalysing([]);
    }, 1400);
  };

  const rows: [string, string][] = [
    ["Ambiance", ambiances.filter((a) => dna.ambiances.includes(a.value)).map((a) => a.label).join(", ") || "À préciser"],
    ["Période", seasons.find((s) => s.value === dna.season)?.label ?? "À préciser"],
    ["Zone", zones.find((z) => z.value === w.zone)?.label ?? "À préciser"],
    ["Invités", `${w.guests}`],
    ["Budget global", euros(w.budget)],
    ["Priorités", priorities.filter((p) => dna.priorities.includes(p.value)).map((p) => p.label).join(", ") || "Aucune"],
    ["Indispensable", mustOptions.filter((m) => dna.musts.includes(m.value)).map((m) => m.label).join(", ") || "Rien d'obligatoire"],
  ];

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Wedding DNA</h1>
          <p className={styles.lead}>{summarize({ ...dna, guests: w.guests, budget: w.budget, zone: w.zone })}</p>
        </div>
        <Link href="/matchs" className="btn btn-sm btn-outline">
          Modifier mon Wedding DNA
        </Link>
      </header>

      <div className={styles.grid}>
        <section className={`${styles.card} ${styles.span5}`} aria-labelledby="dna-t">
          <h2 id="dna-t" className={styles.sectionTitle}>
            Votre projet
          </h2>
          <dl className={d.facts}>
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.small}>Invités, budget et zone se modifient dans votre profil : le Best Match et votre budget se mettent à jour.</p>
        </section>

        <section className={`${styles.card} ${styles.span7}`} aria-labelledby="insp-t">
          <h2 id="insp-t" className={styles.sectionTitle}>
            Vos inspirations
          </h2>
          {dna.inspirations.length ? (
            <div className={d.photos}>
              {dna.inspirations.slice(0, 6).map((src) => (
                <span key={src} className={d.photo}>
                  <Image src={src} alt="" fill sizes="160px" style={{ objectFit: "cover" }} />
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.rowMeta}>Aucune inspiration choisie pour l&apos;instant.</p>
          )}
          <div className={d.upload}>
            <p className={styles.rowMeta}>
              Vos propres images (captures, photos de mariages qui vous plaisent) : Céleste en tire des tags que vous pouvez corriger.
            </p>
            {(dna.uploads?.length ?? 0) > 0 && (
              <ul className={d.uploads}>
                {dna.uploads!.map((u) => (
                  <li key={u.name}>
                    <span>{u.name}</span>
                    <small>Céleste y voit : {u.tags.join(", ")}</small>
                  </li>
                ))}
              </ul>
            )}
            {analysing.length > 0 ? (
              <p className={d.analysing} role="status">
                Analyse de {analysing.length} image{analysing.length > 1 ? "s" : ""} en cours…
              </p>
            ) : (
              <label className="btn btn-outline btn-sm">
                Importer mes images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    const files = [...(e.target.files ?? [])];
                    if (files.length) analyse(files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          <h3 className={d.tagsTitle}>Ce que Céleste en retient</h3>
          <p className={styles.rowMeta}>Retirez, renommez ou ajoutez un tag si Céleste a mal interprété une image : vos recommandations en tiendront compte.</p>
          {dna.tags.length ? (
            <ul className={d.tags}>
              {dna.tags.map((t) =>
                editing?.tag === t ? (
                  <li key={t}>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        renameTag(t, editing.value);
                      }}
                    >
                      <input className={d.tagInput} value={editing.value} onChange={(e) => setEditing({ tag: t, value: e.target.value })} onBlur={() => renameTag(t, editing.value)} aria-label={`Renommer le tag ${t}`} autoFocus />
                    </form>
                  </li>
                ) : (
                  <li key={t}>
                    <button type="button" className={d.tagName} onClick={() => setEditing({ tag: t, value: t })} aria-label={`Renommer le tag ${t}`}>
                      {t}
                    </button>
                    <button type="button" onClick={() => removeTag(t)} aria-label={`Retirer le tag ${t}`}>
                      ×
                    </button>
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p className={styles.small} style={{ marginTop: 8 }}>
              Aucun tag pour l&apos;instant.
            </p>
          )}
          <form
            className={d.addTag}
            onSubmit={(e) => {
              e.preventDefault();
              addTag(newTag);
              setNewTag("");
            }}
          >
            <label className="visually-hidden" htmlFor="new-tag">
              Ajouter un tag
            </label>
            <input id="new-tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Ajouter un tag, par exemple : palette terracotta" />
            <button type="submit" className="btn btn-sm btn-outline" disabled={!newTag.trim()}>
              Ajouter
            </button>
          </form>
          <p className={styles.small} style={{ marginTop: 8 }}>
            Mis à jour le {stamp().slice(0, 10).split("-").reverse().join("/")}.
          </p>
        </section>
      </div>
    </>
  );
}
