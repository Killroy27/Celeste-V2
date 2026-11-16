"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SaveButton } from "@/components/SaveButton";
import { getCategory, priceLabel } from "@/lib/content";
import {
  ambiances,
  computeMatches,
  emptyDna,
  exploreCategories,
  inspirationPool,
  miniTests,
  mustOptions,
  priorities,
  seasons,
  summarize,
  zones,
  type Dna,
  type Match,
} from "@/lib/match";
import styles from "./flow.module.css";

const DNA_KEY = "celeste:dna";

type Step =
  | { id: "intro" }
  | { id: "welcome" }
  | { id: "ambiance" }
  | { id: "inspirations" }
  | { id: "season" }
  | { id: "zone" }
  | { id: "reception" }
  | { id: "priorities" }
  | { id: "category" }
  | { id: "mini"; index: number }
  | { id: "computing" }
  | { id: "results" };

const DNA_STEPS = ["ambiance", "inspirations", "season", "zone", "reception", "priorities"] as const;

function loadDna(): Dna | null {
  try {
    const raw = localStorage.getItem(DNA_KEY);
    return raw ? { ...emptyDna, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function saveDna(d: Dna) {
  try {
    localStorage.setItem(DNA_KEY, JSON.stringify(d));
  } catch {
    /* navigation privée */
  }
}

// Parcours Best Match : Wedding DNA commun → choix du métier → mini-test → calcul → résultats expliqués.
export function MatchFlow() {
  const [dna, setDna] = useState<Dna>(emptyDna);
  const [step, setStep] = useState<Step>({ id: "intro" });
  const [category, setCategory] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasSaved, setHasSaved] = useState(false);

  // Profil vivant (§6.3) : on reprend le Wedding DNA déjà rempli.
  useEffect(() => {
    const saved = loadDna();
    const style = new URLSearchParams(window.location.search).get("style");
    const map: Record<string, string> = { champetre: "champetre", chateau: "chateau", boheme: "boheme", urbain: "urbain" };
    if (saved && saved.ambiances.length) {
      setDna(saved);
      setHasSaved(true);
      setStep({ id: "welcome" });
    } else if (style && map[style]) {
      setDna((d) => ({ ...d, ambiances: [map[style]] }));
    }
  }, []);

  // Mises à jour fonctionnelles : deux clics rapides ne s'écrasent pas.
  const update = (patch: Partial<Dna> | ((d: Dna) => Partial<Dna>)) => setDna((d) => ({ ...d, ...(typeof patch === "function" ? patch(d) : patch) }));
  const go = (s: Step) => {
    setStep(s);
    window.scrollTo({ top: 0 });
  };

  const order: Step[] = useMemo(() => {
    const mini = (miniTests[category] ?? []).map((_, index) => ({ id: "mini", index }) as Step);
    return [{ id: "intro" }, ...DNA_STEPS.map((id) => ({ id }) as Step), { id: "category" }, ...mini, { id: "computing" }, { id: "results" }];
  }, [category]);

  const idx = order.findIndex((s) => s.id === step.id && (s.id !== "mini" || (step.id === "mini" && s.index === step.index)));
  const next = () => {
    if (step.id === "priorities") saveDna(dna);
    const n = order[idx + 1];
    if (n) go(n);
  };
  const back = () => {
    const p = order[idx - 1];
    if (p && p.id !== "intro") go(p);
    else go({ id: hasSaved ? "welcome" : "intro" });
  };

  const phase = ["intro", "welcome"].includes(step.id) ? 0 : (DNA_STEPS as readonly string[]).includes(step.id) ? 1 : step.id === "category" || step.id === "mini" ? 2 : 3;
  const dnaIndex = (DNA_STEPS as readonly string[]).indexOf(step.id);
  const progress = step.id === "results" ? 100 : Math.max(4, Math.round((Math.max(idx, 0) / (order.length - 2)) * 100));

  const matches = useMemo(() => (category ? computeMatches(dna, category, answers) : []), [dna, category, answers]);

  const startCategory = (slug: string) => {
    setCategory(slug);
    setAnswers({});
    const has = (miniTests[slug] ?? []).length > 0;
    go(has ? { id: "mini", index: 0 } : { id: "computing" });
  };

  return (
    <div className={styles.shell} data-espace="best-match">
      {/* Barre du parcours */}
      <header className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label="Céleste, accueil">
          <Image src="/brand/monogram.png" alt="" width={26} height={27} />
          <span>Best Match</span>
        </Link>
        <ol className={styles.phases} aria-label="Étapes">
          {["Votre mariage", "Votre prestataire", "Vos matchs"].map((label, i) => (
            <li key={label} className={phase === i + 1 ? styles.phaseOn : phase > i + 1 ? styles.phaseDone : ""}>
              <span>{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>
        <Link href="/" className={styles.quit}>
          Quitter
        </Link>
        <div className={styles.progress} aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
      </header>

      {step.id === "intro" && <Intro onStart={() => go({ id: "ambiance" })} />}

      {step.id === "welcome" && (
        <Center>
          <div className={styles.welcome}>
            <p className={styles.kicker}>Bon retour</p>
            <h1 className={styles.h1}>Votre Wedding DNA est prêt.</h1>
            <p className={styles.dnaQuote}>{summarize(dna)}</p>
            <div className={styles.row}>
              <button type="button" className="btn" onClick={() => go({ id: "category" })}>
                Trouver mes matchs
              </button>
              <button type="button" className="btn btn-outline" onClick={() => go({ id: "ambiance" })}>
                Modifier mon Wedding DNA
              </button>
            </div>
          </div>
        </Center>
      )}

      {phase === 1 && (
        <Split dna={dna} onEdit={(s) => go({ id: s } as Step)}>
          <p className={styles.kicker}>
            Votre mariage · {dnaIndex + 1} / {DNA_STEPS.length}
          </p>

          {step.id === "ambiance" && (
            <Question title="Quelle ambiance vous ressemble ?" hint="Choisissez jusqu'à 3 ambiances.">
              <div className={styles.photoGrid}>
                {ambiances.map((a) => {
                  const on = dna.ambiances.includes(a.value);
                  return (
                    <button
                      key={a.value}
                      type="button"
                      aria-pressed={on}
                      className={`${styles.photoCard} ${on ? styles.on : ""}`}
                      onClick={() =>
                        update((d) => {
                          const has = d.ambiances.includes(a.value);
                          return { ambiances: has ? d.ambiances.filter((x) => x !== a.value) : d.ambiances.length < 3 ? [...d.ambiances, a.value] : d.ambiances };
                        })
                      }
                    >
                      <Image src={a.photo} alt="" fill sizes="(max-width: 720px) 50vw, 240px" style={{ objectFit: "cover" }} />
                      <span className={styles.photoLabel}>{a.label}</span>
                      <span className={styles.check} aria-hidden="true">
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>
            </Question>
          )}

          {step.id === "inspirations" && (
            <Question title="Quelles images vous parlent ?" hint="Touchez celles que vous aimez. Céleste en tire des mots-clés, que vous pouvez corriger.">
              <div className={styles.inspiGrid}>
                {inspirationPool.map((p) => {
                  const on = dna.inspirations.includes(p.src);
                  return (
                    <button
                      key={p.src}
                      type="button"
                      aria-pressed={on}
                      className={`${styles.inspi} ${on ? styles.on : ""}`}
                      onClick={() =>
                        update((d) => {
                          const insp = d.inspirations.includes(p.src) ? d.inspirations.filter((x) => x !== p.src) : [...d.inspirations, p.src];
                          const tags = [...new Set(inspirationPool.filter((x) => insp.includes(x.src)).flatMap((x) => x.tags))];
                          return { inspirations: insp, tags };
                        })
                      }
                    >
                      <Image src={p.src} alt="" fill sizes="(max-width: 720px) 33vw, 180px" style={{ objectFit: "cover" }} />
                      <span className={styles.heart} aria-hidden="true">
                        {on ? "♥" : "♡"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {dna.tags.length > 0 && (
                <div className={styles.tags}>
                  <span>Ce que Céleste en retient :</span>
                  {dna.tags.map((t) => (
                    <button key={t} type="button" className={styles.tag} onClick={() => update({ tags: dna.tags.filter((x) => x !== t) })} aria-label={`Retirer ${t}`}>
                      {t} <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
              )}
            </Question>
          )}

          {step.id === "season" && (
            <Question title="Quand imaginez-vous le grand jour ?" hint="Une saison suffit. Une date précise, si vous l'avez.">
              <div className={styles.tiles}>
                {seasons.map((s) => (
                  <button key={s.value} type="button" aria-pressed={dna.season === s.value} className={`${styles.tile} ${dna.season === s.value ? styles.on : ""}`} onClick={() => update({ season: s.value })}>
                    <strong>{s.label}</strong>
                    <span>{s.sub}</span>
                  </button>
                ))}
              </div>
              <div className={styles.inline}>
                <label className="field">
                  Date précise (facultatif)
                  <input type="date" value={dna.date ?? ""} onChange={(e) => update({ date: e.target.value })} />
                </label>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={dna.flexible} onChange={(e) => update({ flexible: e.target.checked })} />
                  Notre date est flexible
                </label>
              </div>
            </Question>
          )}

          {step.id === "zone" && (
            <Question title="Où voyez-vous votre mariage ?" hint="La région qui vous inspire.">
              <div className={styles.tiles}>
                {zones.map((z) => (
                  <button key={z.value} type="button" aria-pressed={dna.zone === z.value} className={`${styles.tile} ${dna.zone === z.value ? styles.on : ""}`} onClick={() => update({ zone: z.value })}>
                    <strong>{z.label}</strong>
                    <span>{z.idf ? "Le plus de choix aujourd'hui" : "Prestataires qui se déplacent"}</span>
                  </button>
                ))}
              </div>
            </Question>
          )}

          {step.id === "reception" && (
            <Question title="Votre réception, en deux curseurs" hint="Des estimations suffisent, vous pourrez les changer.">
              <Range label="Invités" value={dna.guests} min={20} max={400} step={10} display={`${dna.guests} invités`} onChange={(n) => update({ guests: n })} />
              <Range
                label="Budget global"
                value={dna.budget}
                min={5000}
                max={100000}
                step={1000}
                display={`${dna.budget.toLocaleString("fr-FR")} €`}
                note={dna.budget < 15000 ? "Essentiel" : dna.budget < 35000 ? "Confort" : dna.budget < 60000 ? "Prestige" : "Exception"}
                onChange={(n) => update({ budget: n })}
              />
            </Question>
          )}

          {step.id === "priorities" && (
            <Question title="Ce qui compte le plus pour vous" hint="Choisissez jusqu'à 3 priorités, puis ce qui est vraiment indispensable.">
              <div className={styles.prioGrid}>
                {priorities.map((p) => {
                  const rank = dna.priorities.indexOf(p.value);
                  const on = rank >= 0;
                  const full = !on && dna.priorities.length >= 3;
                  const icon = exploreCategories.find((c) => c.slug === p.value)?.icon;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      className={styles.prio}
                      aria-pressed={on}
                      data-full={full || undefined}
                      onClick={() =>
                        update((d) => ({
                          priorities: d.priorities.includes(p.value) ? d.priorities.filter((x) => x !== p.value) : d.priorities.length < 3 ? [...d.priorities, p.value] : d.priorities,
                        }))
                      }
                    >
                      {icon && <Image src={icon} alt="" width={40} height={40} className={styles.prioIcon} />}
                      <span>{p.label}</span>
                      <b className={styles.prioRank} aria-hidden>
                        {on ? rank + 1 : ""}
                      </b>
                    </button>
                  );
                })}
              </div>
              <p className={styles.prioCount}>{dna.priorities.length === 0 ? "Aucune priorité pour l'instant" : `${dna.priorities.length} sur 3 · dans l'ordre de vos clics`}</p>
              <p className={styles.subQ}>Non négociable</p>
              <div className={styles.musts}>
                {mustOptions.map((m) => {
                  const on = dna.musts.includes(m.value);
                  return (
                    <button
                      key={m.value}
                      type="button"
                      role="switch"
                      aria-checked={on}
                      className={styles.must}
                      onClick={() => update((d) => ({ musts: d.musts.includes(m.value) ? d.musts.filter((x) => x !== m.value) : [...d.musts, m.value] }))}
                    >
                      <span className={styles.mustIcon} aria-hidden>
                        <MustIcon kind={m.value} />
                      </span>
                      <span className={styles.mustText}>
                        <strong>{m.label}</strong>
                        <small>{m.sub}</small>
                      </span>
                      <span className={styles.switch} aria-hidden />
                    </button>
                  );
                })}
              </div>
              <p className={styles.hintSmall}>Un critère indispensable écarte les profils qui ne le respectent pas. Les autres sont simplement pris en compte.</p>
            </Question>
          )}

          <Nav
            onBack={back}
            onNext={next}
            nextLabel={step.id === "priorities" ? "Enregistrer mon Wedding DNA" : "Continuer"}
            disabled={(step.id === "ambiance" && dna.ambiances.length === 0) || (step.id === "season" && !dna.season) || (step.id === "zone" && !dna.zone)}
          />
        </Split>
      )}

      {step.id === "category" && (
        <Center wide>
          <p className={styles.kicker}>Votre prestataire</p>
          <h1 className={styles.h1}>Par quoi commencez-vous ?</h1>
          <p className={styles.lead}>Votre Wedding DNA sert pour tous les métiers. Vous pourrez en explorer d&apos;autres ensuite.</p>
          <div className={styles.catGrid}>
            {exploreCategories.map((c) => (
              <button key={c.slug} type="button" className={styles.catCard} onClick={() => startCategory(c.slug)}>
                <span className={styles.catPhoto}>
                  <Image src={c.cover} alt="" fill sizes="(max-width: 720px) 50vw, 260px" style={{ objectFit: "cover" }} />
                </span>
                <span className={styles.catText}>
                  <Image src={c.icon} alt="" width={30} height={30} />
                  {c.plural}
                  {dna.priorities.includes(c.slug) && <em>Priorité</em>}
                </span>
              </button>
            ))}
          </div>
          <div className={styles.navCenter}>
            <button type="button" className={styles.back} onClick={back}>
              ← Revenir à mon Wedding DNA
            </button>
          </div>
        </Center>
      )}

      {step.id === "mini" && (
        <MiniStep
          category={category}
          index={step.index}
          answers={answers}
          onAnswer={(key, value) => {
            setAnswers((a) => ({ ...a, [key]: value }));
            setTimeout(next, 260); // un tap suffit (§7.1)
          }}
          onBack={back}
        />
      )}

      {step.id === "computing" && <Computing category={category} top={matches[0]} onDone={() => go({ id: "results" })} />}

      {step.id === "results" && (
        <Results
          dna={dna}
          category={category}
          matches={matches}
          onRefine={() => go({ id: "mini", index: 0 })}
          onCategory={(slug) => startCategory(slug)}
          onEditDna={() => go({ id: "ambiance" })}
        />
      )}
    </div>
  );
}

/* ---------- Écrans ---------- */

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className={styles.intro}>
      <div className={styles.introText}>
        <p className={styles.kicker}>Best Match · 2 minutes</p>
        <h1 className={styles.hero}>Dites-nous qui vous êtes. On vous dit qui choisir.</h1>
        <p className={styles.lead}>Quelques images, quelques curseurs. Céleste vous présente les prestataires qui vous ressemblent, et vous explique pourquoi.</p>
        <ul className={styles.introSteps}>
          <li>
            <b>1</b> Votre mariage, une seule fois
          </li>
          <li>
            <b>2</b> Une ou deux questions par métier
          </li>
          <li>
            <b>3</b> Vos matchs, score expliqué
          </li>
        </ul>
        <button type="button" className="btn" onClick={onStart}>
          Commencer
        </button>
        <p className={styles.hintSmall}>Aucun compte nécessaire pour voir vos matchs.</p>
      </div>
      <div className={styles.introWall} aria-hidden="true">
        {["/photos/field.jpg", "/photos/kente.jpg", "/photos/chateau.jpg", "/photos/dance.jpg", "/photos/florist.jpg", "/photos/rings.jpg"].map((src, i) => (
          <span key={src} className={styles.wallTile} style={{ animationDelay: `${i * 0.12}s` }}>
            <Image src={src} alt="" fill sizes="240px" style={{ objectFit: "cover" }} priority={i < 2} />
          </span>
        ))}
      </div>
    </div>
  );
}

function Split({ dna, children, onEdit }: { dna: Dna; children: React.ReactNode; onEdit: (s: string) => void }) {
  return (
    <div className={styles.split}>
      <main className={styles.main}>{children}</main>
      <DnaPanel dna={dna} onEdit={onEdit} />
    </div>
  );
}

function Center({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return <main className={`${styles.center} ${wide ? styles.centerWide : ""}`}>{children}</main>;
}

function Question({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className={styles.question} key={title}>
      <h1 className={styles.h1}>{title}</h1>
      <p className={styles.lead}>{hint}</p>
      <div className={styles.answers}>{children}</div>
    </section>
  );
}

function Nav({ onBack, onNext, nextLabel, disabled }: { onBack: () => void; onNext: () => void; nextLabel: string; disabled?: boolean }) {
  return (
    <div className={styles.nav}>
      <button type="button" className={styles.back} onClick={onBack}>
        ← Retour
      </button>
      <button type="button" className="btn" onClick={onNext} disabled={disabled}>
        {nextLabel}
      </button>
    </div>
  );
}

function Range({ label, value, min, max, step, display, note, onChange }: { label: string; value: number; min: number; max: number; step: number; display: string; note?: string; onChange: (n: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className={styles.range}>
      <span className={styles.rangeHead}>
        <span>{label}</span>
        <strong>
          {display}
          {note && <em>{note}</em>}
        </strong>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ ["--pct" as string]: `${pct}%` }} />
    </label>
  );
}

// Le Wedding DNA se construit sous les yeux du couple.
function DnaPanel({ dna, onEdit }: { dna: Dna; onEdit: (s: string) => void }) {
  const amb = ambiances.filter((a) => dna.ambiances.includes(a.value));
  const rows: [string, string, string][] = [
    ["ambiance", "Ambiance", amb.map((a) => a.label).join(", ")],
    ["inspirations", "Inspirations", dna.tags.slice(0, 3).join(", ")],
    ["season", "Quand", seasons.find((s) => s.value === dna.season)?.label ?? ""],
    ["zone", "Où", zones.find((z) => z.value === dna.zone)?.label ?? ""],
    ["reception", "Réception", dna.guests && dna.budget ? `${dna.guests} invités · ${dna.budget.toLocaleString("fr-FR")} €` : ""],
    ["priorities", "Priorités", priorities.filter((p) => dna.priorities.includes(p.value)).map((p) => p.label).join(", ")],
  ];
  return (
    <aside className={styles.panel} aria-label="Votre Wedding DNA">
      <div className={styles.panelCard}>
        <div className={styles.panelCollage}>
          {(dna.inspirations.length ? dna.inspirations : amb.map((a) => a.photo)).slice(0, 4).map((src) => (
            <span key={src}>
              <Image src={src} alt="" fill sizes="120px" style={{ objectFit: "cover" }} />
            </span>
          ))}
          {!dna.inspirations.length && !amb.length && <p>Vos choix apparaîtront ici.</p>}
        </div>
        <p className={styles.panelTitle}>Votre Wedding DNA</p>
        <ul className={styles.panelRows}>
          {rows.map(([id, k, val]) => (
            <li key={k} className={val ? styles.filled : ""}>
              <span>{k}</span>
              {val ? (
                <button type="button" onClick={() => onEdit(id)}>
                  {val}
                </button>
              ) : (
                <i>—</i>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function MiniStep({ category, index, answers, onAnswer, onBack }: { category: string; index: number; answers: Record<string, string>; onAnswer: (k: string, v: string) => void; onBack: () => void }) {
  const cat = getCategory(category)!;
  const qs = miniTests[category] ?? [];
  const q = qs[index];
  if (!q) return null;
  return (
    <Center wide>
      <p className={styles.kicker}>
        {cat.plural} · question {index + 1} sur {qs.length}
      </p>
      <h1 className={styles.h1} key={q.key}>
        {q.label}
      </h1>
      <p className={styles.lead}>Un seul choix, un seul tap. Céleste connaît déjà le reste.</p>
      <div className={styles.miniGrid}>
        {q.options.map((o) => (
          <button key={o.value} type="button" aria-pressed={answers[q.key] === o.value} className={`${styles.miniCard} ${answers[q.key] === o.value ? styles.on : ""}`} onClick={() => onAnswer(q.key, o.value)}>
            {o.photo && (
              <span className={styles.miniPhoto}>
                <Image src={o.photo} alt="" fill sizes="(max-width: 720px) 100vw, 360px" style={{ objectFit: "cover" }} />
              </span>
            )}
            <strong>{o.label}</strong>
            {o.sub && <span>{o.sub}</span>}
          </button>
        ))}
      </div>
      <div className={styles.navCenter}>
        <button type="button" className={styles.back} onClick={onBack}>
          ← Retour
        </button>
      </div>
    </Center>
  );
}

// Animation de calcul (reprise du projet d'origine) : la jauge monte, les raisons défilent.
function Computing({ category, top, onDone }: { category: string; top?: Match; onDone: () => void }) {
  const cat = getCategory(category);
  const target = top?.score ?? 90;
  const [value, setValue] = useState(0);
  const phases = ["Lecture de votre Wedding DNA…", "Comparaison des styles…", "Vérification des disponibilités…", `Sélection des ${cat?.plural.toLowerCase() ?? "prestataires"}…`];
  const [phase, setPhase] = useState(0);
  const finish = useCallback(onDone, [onDone]);

  useEffect(() => {
    const duration = 2600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      setPhase(Math.min(phases.length - 1, Math.floor(t * phases.length)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(finish, 450);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const r = 86;
  const c = 2 * Math.PI * r;
  return (
    <Center>
      <div className={styles.computing} role="status" aria-live="polite">
        <svg viewBox="0 0 200 200" className={styles.gauge} aria-hidden="true">
          <circle cx="100" cy="100" r={r} fill="none" stroke="#efe7dc" strokeWidth="10" />
          <circle cx="100" cy="100" r={r} fill="none" stroke="#EEB048" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 100 100)" />
        </svg>
        <div className={styles.gaugeValue}>
          <strong>{value}</strong>
          <span>% de compatibilité</span>
        </div>
        <p className={styles.phase}>{phases[phase]}</p>
      </div>
    </Center>
  );
}

/* ---------- Résultats (§7.5, §9.3) ---------- */

function Ring({ score, size = 64 }: { score: number; size?: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <span className={styles.ring} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="#EEB048" strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 32 32)" />
      </svg>
      <b>{score}%</b>
    </span>
  );
}

function MatchCard({ m, rank }: { m: Match; rank: number }) {
  const v = m.vendor;
  return (
    <article className={styles.match} style={{ animationDelay: `${rank * 0.12}s` }}>
      <div className={styles.matchPhoto}>
        <Image src={v.photo} alt={v.name} fill sizes="(max-width: 900px) 100vw, 420px" style={{ objectFit: "cover", objectPosition: v.pos ?? "50% 40%" }} />
        <span className={styles.rank}>{rank === 0 ? "Votre meilleur match" : `Match n° ${rank + 1}`}</span>
        <SaveButton slug={v.slug} name={v.name} className={styles.matchSave} />
        <span className={styles.matchRing}>
          <Ring score={m.score} />
        </span>
      </div>
      <div className={styles.matchBody}>
        <div className={styles.matchHead}>
          <div>
            <h3>{v.name}</h3>
            <span>
              {v.area} · ★ {v.rating} · dès {priceLabel(v)}
            </span>
          </div>
        </div>
        <p className={styles.why}>Pourquoi ce match</p>
        <ul className={styles.reasons}>
          {m.reasons.map((r) => (
            <li key={r}>
              <span>✓</span>
              {r}
            </li>
          ))}
          {m.gaps.map((g) => (
            <li key={g} className={styles.gap}>
              <span>≈</span>
              {g}
            </li>
          ))}
        </ul>
        <p className={styles.meta}>
          {m.availability} · Confiance : {m.confidence}
        </p>
        <div className={styles.matchCtas}>
          <Link href={`/prestataire/${v.slug}`} className="btn btn-sm">
            Voir la fiche
          </Link>
          <Link href={`/prestataire/${v.slug}#contact`} className="btn btn-sm btn-outline">
            Écrire
          </Link>
        </div>
      </div>
    </article>
  );
}

function Results({ dna, category, matches, onRefine, onCategory, onEditDna }: { dna: Dna; category: string; matches: Match[]; onRefine: () => void; onCategory: (s: string) => void; onEditDna: () => void }) {
  const cat = getCategory(category)!;
  const kept = matches.filter((m) => !m.excluded);
  const top = kept.slice(0, 3);
  const close = kept.slice(3).filter((m) => m.score >= 70);
  const budget = kept.slice(3).filter((m) => m.withinBudget && m.score < 70);
  const excluded = matches.filter((m) => m.excluded);

  return (
    <div className={styles.results}>
      <div className={styles.resultsHead}>
        <div>
          <p className={styles.kicker}>Vos matchs · {cat.plural}</p>
          <h1 className={styles.h1}>{top.length ? `${top.length} ${cat.plural.toLowerCase()} faits pour vous` : "Aucun match avec vos critères indispensables"}</h1>
          <p className={styles.dnaQuote}>
            {summarize(dna)}{" "}
            <button type="button" className={styles.linkBtn} onClick={onEditDna}>
              Modifier
            </button>
          </p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={onRefine}>
          Affiner mes résultats
        </button>
      </div>

      {top.length > 0 ? (
        <div className={styles.matches}>
          {top.map((m, i) => (
            <MatchCard key={m.vendor.slug} m={m} rank={i} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>Vos critères indispensables écartent tous les profils de ce métier. Assouplissez-en un pour voir des propositions.</p>
          <button type="button" className="btn btn-sm" onClick={onEditDna}>
            Revoir mes critères
          </button>
        </div>
      )}

      {close.length > 0 && <Row title="Très proches de vos critères" items={close} />}
      {budget.length > 0 && <Row title="Compatibles avec votre budget" items={budget} />}
      {excluded.length > 0 && <p className={styles.excludedNote}>{excluded.length} profil(s) écarté(s) par vos critères indispensables.</p>}

      <section className={styles.next}>
        <h2>Continuez avec un autre métier</h2>
        <p>Votre Wedding DNA est déjà rempli : une ou deux questions suffisent.</p>
        <div className={styles.nextCats}>
          {exploreCategories
            .filter((c) => c.slug !== category)
            .map((c) => (
              <button key={c.slug} type="button" className={styles.nextCat} onClick={() => onCategory(c.slug)}>
                <span className={styles.nextPhoto}>
                  <Image src={c.cover} alt="" fill sizes="72px" style={{ objectFit: "cover" }} />
                </span>
                <span className={styles.nextText}>
                  <strong>{c.plural}</strong>
                  <small>{(miniTests[c.slug]?.length ?? 1) > 1 ? "2 questions" : "1 question"}</small>
                </span>
                <svg className={styles.nextArrow} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            ))}
        </div>
        <p className={styles.hintSmall}>
          Pour garder vos matchs et écrire aux prestataires, votre espace Céleste sera créé au premier message. Rien à faire d&apos;ici là.
        </p>
      </section>
    </div>
  );
}

function MustIcon({ kind }: { kind: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      {kind === "date" && (
        <g {...p}>
          <rect x="3.5" y="5" width="17" height="15" rx="3" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </g>
      )}
      {kind === "zone" && (
        <g {...p}>
          <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </g>
      )}
      {kind === "budget" && (
        <g {...p}>
          <path d="M17 6.5A6.5 6.5 0 1 0 17 17.5M4 10.5h9M4 13.5h9" />
        </g>
      )}
      {kind === "capacity" && (
        <g {...p}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5M16 5.2a3 3 0 0 1 0 5.6M18 14.4c1.6.6 2.7 2.2 3 4.6" />
        </g>
      )}
    </svg>
  );
}

function Row({ title, items }: { title: string; items: Match[] }) {
  return (
    <section className={styles.rowSection}>
      <h2>{title}</h2>
      <div className={styles.rowGrid}>
        {items.map((m) => (
          <Link key={m.vendor.slug} href={`/prestataire/${m.vendor.slug}`} className={styles.small}>
            <span className={styles.smallPhoto}>
              <Image src={m.vendor.photo} alt="" fill sizes="240px" style={{ objectFit: "cover" }} />
              <b>{m.score}%</b>
            </span>
            <strong>{m.vendor.name}</strong>
            <span>
              {m.vendor.area} · dès {priceLabel(m.vendor)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
