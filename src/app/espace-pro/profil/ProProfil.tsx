"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { getVendor } from "@/lib/content";
import { specFields, specsFor } from "@/lib/vendorDetail";
import { euros, stamp } from "@/lib/format";
import { isVerified, PRO_SLUG, proIdentity, profileCompletion, selectCriteria, usePro, type Formula, type Pro } from "@/lib/pro";
import { openDisputeList, useDisputes } from "@/lib/disputes";
import { NotificationPrefs } from "../../espace/NotificationPrefs";
import { StatusChip } from "../../espace/ui";
import { PRO_KINDS } from "@/lib/notifications";
import styles from "../../espace/espace.module.css";
import p from "../pro.module.css";

const VIEWS = [
  { id: "fiche", label: "Ma fiche" },
  { id: "catalogue", label: "Formules et options" },
  { id: "confiance", label: "Vérifié et Select" },
  { id: "avis", label: "Avis" },
  { id: "notifications", label: "Notifications" },
] as const;

const uid = () => Math.random().toString(36).slice(2, 8);

// Mon profil (CDC §16.4, §18, §24, §30.2) : fiche publique, catalogue, confiance, avis.
export function ProProfil() {
  const params = useSearchParams();
  const view = VIEWS.find((v) => v.id === params.get("vue"))?.id ?? "fiche";
  const { pro, update } = usePro();
  if (!pro) return null;

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Mon profil</h1>
          <p className={styles.lead}>Ce que voient les couples, et ce qui construit leur confiance.</p>
        </div>
        {!pro.account && (
          <Link href={`/prestataire/${PRO_SLUG}`} className="btn btn-outline btn-sm">
            Voir ma fiche publique
          </Link>
        )}
      </header>
      <nav className={styles.subnav} aria-label="Mon profil">
        {VIEWS.map((v) => (
          <Link key={v.id} href={`/espace-pro/profil?vue=${v.id}`} aria-current={v.id === view ? "page" : undefined} scroll={false}>
            {v.label}
          </Link>
        ))}
      </nav>
      {view === "fiche" && <Fiche pro={pro} update={update} />}
      {view === "catalogue" && <Catalogue pro={pro} update={update} />}
      {view === "confiance" && <Trust pro={pro} update={update} />}
      {view === "avis" && <Reviews pro={pro} update={update} />}
      {view === "notifications" && (
        <div className={styles.grid}>
          <NotificationPrefs kinds={PRO_KINDS} emailOff={pro.emailOff ?? []} email={pro.account?.email ?? ""} onChange={(next) => update((x) => ({ ...x, emailOff: next }))} />
        </div>
      )}
    </>
  );
}

type Props = { pro: Pro; update: (fn: (p: Pro) => Pro) => void };

/* ---------- Fiche ---------- */

function Fiche({ pro, update }: Props) {
  const id = proIdentity(pro);
  const [saved, setSaved] = useState(false);
  const photos = pro.photos ?? [];
  const completion = profileCompletion(pro);
  return (
    <div className={styles.grid}>
      <section className={`${styles.card} ${styles.span7}`} aria-labelledby="fiche-t">
        <h2 id="fiche-t" className={styles.sectionTitle}>
          Présentation
        </h2>
        <form
          className={p.form}
          onChange={() => setSaved(false)}
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const get = (k: string) => String(f.get(k) ?? "").trim();
            update((x) => ({ ...x, profile: { description: get("description"), responseTime: get("responseTime"), area: get("area"), style: get("style"), languages: get("languages"), team: get("team") } }));
            setSaved(true);
          }}
        >
          <label className="field">
            Présentation
            <textarea name="description" rows={5} defaultValue={pro.profile.description} />
          </label>
          <div className={p.row2}>
            <label className="field">
              Zone principale
              <input name="area" defaultValue={pro.profile.area} />
            </label>
            <label className="field">
              Style
              <input name="style" defaultValue={pro.profile.style} />
            </label>
          </div>
          <div className={p.row2}>
            <label className="field">
              Langues parlées
              <input name="languages" defaultValue={pro.profile.languages} />
            </label>
            <label className="field">
              Équipe
              <input name="team" defaultValue={pro.profile.team} />
            </label>
          </div>
          <label className="field">
            Délai de réponse habituel
            <input name="responseTime" defaultValue={pro.profile.responseTime} />
          </label>
          <div className={p.builderActions}>
            <button type="submit" className="btn">
              Enregistrer
            </button>
            {saved && (
              <span className={styles.small} role="status">
                Enregistré
              </span>
            )}
          </div>
          {!pro.account && <p className={styles.small}>Votre présentation et vos informations métier sont reprises sur votre fiche publique.</p>}
        </form>

        <SpecsForm pro={pro} update={update} />

        {pro.account && (
          <div className={p.photosBlock}>
            <h3 className={p.subTitle}>Photos</h3>
            <p className={styles.rowMeta}>Vos plus belles réalisations : au moins 3 pour publier la fiche. Les couples choisissent d&apos;abord sur les images.</p>
            {photos.length > 0 && (
              <ul className={p.photoList}>
                {photos.map((name) => (
                  <li key={name}>
                    <span>{name}</span>
                    <button type="button" className={styles.iconBtn} onClick={() => update((x) => ({ ...x, photos: (x.photos ?? []).filter((n) => n !== name) }))} aria-label={`Retirer ${name}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {/* Prototype : seuls les noms des fichiers sont gardés, rien n'est envoyé. */}
            <label className="btn btn-outline btn-sm">
              Ajouter des photos
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  const names = [...(e.target.files ?? [])].map((f) => f.name);
                  update((x) => ({ ...x, photos: [...new Set([...(x.photos ?? []), ...names])] }));
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        )}
      </section>

      <div className={`${styles.span5} ${p.calSide}`}>
        <section className={styles.card} aria-labelledby="prev-t">
          <h2 id="prev-t" className={styles.sectionTitle}>
            Aperçu
          </h2>
          <div className={p.preview}>
            <span className={p.previewPhoto}>
              {id.photo ? (
                <Image src={id.photo} alt="" fill sizes="360px" style={{ objectFit: "cover", objectPosition: id.pos }} />
              ) : (
                <span className={p.previewEmpty}>{photos.length ? `${photos.length} photo${photos.length > 1 ? "s" : ""} ajoutée${photos.length > 1 ? "s" : ""}` : "Vos photos apparaîtront ici"}</span>
              )}
            </span>
            <strong>{id.name}</strong>
            <span className={styles.rowMeta}>
              {[id.categoryLabel, pro.profile.style, pro.profile.area].filter(Boolean).join(" · ")}
              {id.rating ? ` · ★ ${id.rating} (${id.reviewsCount} avis)` : " · Nouveau sur Céleste"}
            </span>
            <span className={styles.rowMeta}>Répond en général en {pro.profile.responseTime}</span>
            {isVerified(pro) && <StatusChip status="Vérifié" />}
          </div>
        </section>
        <section className={styles.card} aria-labelledby="comp-t">
          <div className={styles.cardHead}>
            <h2 id="comp-t" className={styles.sectionTitle}>
              Complétude
            </h2>
            <span className={styles.small}>{completion.percent} %</span>
          </div>
          <ul className={p.checkList}>
            {completion.checks.map((c) => (
              <li key={c.label} data-ok={c.ok}>
                <span aria-hidden="true">{c.ok ? "✓" : "○"}</span>
                {c.label}
                <span className="visually-hidden">{c.ok ? " : fait" : " : à faire"}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

// Informations propres au métier (§10.2) : saisies une fois, reprises par la fiche, les filtres et le Best Match (§10.3).
function SpecsForm({ pro, update }: Props) {
  const id = proIdentity(pro);
  const v = id.slug ? getVendor(id.slug) : undefined;
  const defaults = Object.fromEntries(v ? specsFor(v) : []);
  const fields = specFields(id.category);
  const [saved, setSaved] = useState(false);
  if (!fields.length) return null;
  return (
    <form
      className={p.photosBlock}
      onChange={() => setSaved(false)}
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        update((x) => ({ ...x, specs: Object.fromEntries(fields.map((k) => [k, String(f.get(k) ?? "").trim()])) }));
        setSaved(true);
      }}
    >
      <h3 className={p.subTitle}>Informations métier</h3>
      <p className={styles.rowMeta}>Ce qui distingue votre offre : les couples les voient sur votre fiche et le Best Match s&apos;en sert.</p>
      <div className={p.specGrid}>
        {fields.map((k) => (
          <label key={k} className="field">
            {k}
            <input name={k} defaultValue={pro.specs?.[k] ?? defaults[k] ?? ""} />
          </label>
        ))}
      </div>
      <div className={p.builderActions}>
        <button type="submit" className="btn btn-sm">
          Enregistrer
        </button>
        {saved && (
          <span className={styles.small} role="status">
            Enregistré
          </span>
        )}
      </div>
    </form>
  );
}

/* ---------- Catalogue (§16.4) ---------- */

function Catalogue({ pro, update }: Props) {
  const setFormula = (id: string, patch: Partial<Formula>) => update((x) => ({ ...x, formulas: x.formulas.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  return (
    <div className={styles.grid}>
      <section className={`${styles.card} ${styles.span12}`} aria-labelledby="form-t">
        <div className={styles.cardHead}>
          <h2 id="form-t" className={styles.sectionTitle}>
            Formules
          </h2>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => update((x) => ({ ...x, formulas: [...x.formulas, { id: uid(), name: "Nouvelle formule", price: 0, includes: ["Prestation"] }] }))}
          >
            Ajouter une formule
          </button>
        </div>
        <p className={styles.rowMeta}>Prix « à partir de », ou « sur devis » quand tout dépend du projet. Vous adaptez ensuite chaque offre au couple.</p>
        <div className={p.formulas}>
          {pro.formulas.map((f) => (
            <article key={f.id} className={p.formula}>
              <label className="field">
                Nom
                <input value={f.name} onChange={(e) => setFormula(f.id, { name: e.target.value })} />
              </label>
              <div className={p.row2}>
                <label className="field">
                  Prix à partir de
                  <input type="number" min={0} step={10} value={f.price ?? ""} disabled={f.price === null} onChange={(e) => setFormula(f.id, { price: Math.max(0, Number(e.target.value) || 0) })} />
                </label>
                <label className={p.optional} style={{ alignSelf: "end", paddingBottom: 12 }}>
                  <input type="checkbox" checked={f.price === null} onChange={(e) => setFormula(f.id, { price: e.target.checked ? null : 0 })} />
                  Sur devis
                </label>
              </div>
              <label className="field">
                Ce qui est inclus (une ligne par élément)
                <textarea rows={3} value={f.includes.join("\n")} onChange={(e) => setFormula(f.id, { includes: e.target.value.split("\n") })} />
              </label>
              <div className={p.formulaFoot}>
                <span className={styles.rowMeta}>{f.price === null ? "Sur devis" : `Dès ${euros(f.price)}`}</span>
                <button type="button" className={p.textBtn} onClick={() => update((x) => ({ ...x, formulas: x.formulas.filter((y) => y.id !== f.id) }))} disabled={pro.formulas.length <= 1}>
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.card} ${styles.span12}`} aria-labelledby="opt-t">
        <div className={styles.cardHead}>
          <h2 id="opt-t" className={styles.sectionTitle}>
            Options
          </h2>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => update((x) => ({ ...x, options: [...x.options, { id: uid(), label: "Nouvelle option", price: 0 }] }))}>
            Ajouter une option
          </button>
        </div>
        <p className={styles.rowMeta}>Les options chiffrées sont ce que le couple peut retirer pour tenir son budget, sans que vous baissiez vos prix.</p>
        <ul className={p.optionList}>
          {pro.options.map((o) => (
            <li key={o.id}>
              <label className="visually-hidden" htmlFor={`o-${o.id}`}>
                Option
              </label>
              <input id={`o-${o.id}`} value={o.label} onChange={(e) => update((x) => ({ ...x, options: x.options.map((y) => (y.id === o.id ? { ...y, label: e.target.value } : y)) }))} />
              <label className={p.amount}>
                <span className="visually-hidden">Prix de {o.label}</span>
                <input type="number" min={0} step={10} value={o.price} onChange={(e) => update((x) => ({ ...x, options: x.options.map((y) => (y.id === o.id ? { ...y, price: Math.max(0, Number(e.target.value) || 0) } : y)) }))} />
                <span aria-hidden="true">€</span>
              </label>
              <button type="button" className={styles.iconBtn} onClick={() => update((x) => ({ ...x, options: x.options.filter((y) => y.id !== o.id) }))} aria-label={`Supprimer ${o.label}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------- Vérifié et Select (§18) ---------- */

function Trust({ pro, update }: Props) {
  const { disputes } = useDisputes();
  const openCount = openDisputeList(disputes).filter((d) => d.vendorSlug === PRO_SLUG && !pro.account).length;
  const criteria = selectCriteria(pro, openCount);
  const select = criteria.every((c) => c.ok);
  return (
    <div className={styles.grid}>
      <section className={`${styles.card} ${p.half}`} aria-labelledby="verif-t">
        <div className={styles.cardHead}>
          <h2 id="verif-t" className={styles.sectionTitle}>
            Céleste Vérifié
          </h2>
          <StatusChip status={isVerified(pro) ? "Vérifié" : "Vérification en cours"} />
        </div>
        <p className={styles.rowMeta}>Confirme l&apos;existence et l&apos;identité professionnelles. Ce statut ne garantit pas la qualité de la prestation.</p>
        <ul className={styles.list}>
          {pro.verification.map((v) => (
            <li key={v.id} className={styles.row}>
              <span className={p.kindDot} aria-hidden="true" />
              <div>
                <p className={styles.rowTitle}>{v.label}</p>
                {v.detail && <p className={styles.rowMeta}>{v.detail}</p>}
                {v.status === "À fournir" && (
                  <button type="button" className={p.textBtn} onClick={() => update((x) => ({ ...x, verification: x.verification.map((y) => (y.id === v.id ? { ...y, status: "En attente", detail: "Document envoyé, en cours de vérification" } : y)) }))}>
                    Envoyer le document
                  </button>
                )}
              </div>
              <StatusChip status={v.status} />
            </li>
          ))}
        </ul>
      </section>

      <section className={`${styles.card} ${p.half}`} aria-labelledby="select-t">
        <div className={styles.cardHead}>
          <h2 id="select-t" className={styles.sectionTitle}>
            Céleste Select
          </h2>
          {select ? (
            <span className={p.select}>
              <i aria-hidden="true">◆</i> Select
            </span>
          ) : (
            <StatusChip status="Select : en progression" />
          )}
        </div>
        <p className={styles.rowMeta}>Un signe de confiance lié à la performance réelle : il ne s&apos;achète pas. Seuils de référence au lancement, ajustables par Céleste.</p>
        <ul className={p.checkList}>
          {criteria.map((c) => (
            <li key={c.label} data-ok={c.ok}>
              <span aria-hidden="true">{c.ok ? "✓" : "○"}</span>
              <span className={p.criterion}>
                {c.label}
                <b>{c.value}</b>
              </span>
              <span className="visually-hidden">{c.ok ? " : rempli" : " : non rempli"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------- Avis (§24) ---------- */

const REPORT_REASONS = ["Le couple n'a pas eu de prestation de ma part", "Propos injurieux ou discriminatoires", "Hors sujet, sans rapport avec la prestation", "Faits inexacts que je peux démontrer"];

function Reviews({ pro, update }: Props) {
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [reporting, setReporting] = useState<{ i: number; reason: string } | null>(null);
  if (pro.account) {
    return (
      <div className={styles.empty}>
        <p>Pas encore d&apos;avis. Seuls les couples qui ont réservé et payé via Céleste peuvent en laisser un, après votre prestation : ils apparaîtront ici, avec la possibilité d&apos;y répondre.</p>
      </div>
    );
  }
  const v = getVendor(PRO_SLUG)!;
  return (
    <section className={styles.card} aria-labelledby="rev-t">
      <div className={styles.cardHead}>
        <h2 id="rev-t" className={styles.sectionTitle}>
          Avis vérifiés
        </h2>
        <span className={styles.small}>
          ★ {v.rating} · {v.reviewsCount} avis
        </span>
      </div>
      <p className={styles.rowMeta}>Seuls les couples qui ont réservé et payé via Céleste peuvent laisser un avis. Vous pouvez y répondre publiquement, une fois, ou le signaler à la modération ; vous ne pouvez pas le supprimer.</p>
      <ul className={styles.list}>
        {v.reviews.map((r, i) => (
          <li key={i} className={p.review}>
            <div className={p.reviewHead}>
              <strong>{r.author}</strong>
              <span className={styles.rowMeta}>
                {"★".repeat(r.rating)} · {r.date}
              </span>
            </div>
            <p>{r.text}</p>
            {pro.reports?.[i] ? (
              <p className={styles.rowMeta}>
                <StatusChip status={pro.reports[i].status === "Signalé" ? "Signalé à Céleste" : pro.reports[i].status === "Retiré" ? "Retiré par la modération" : "Conservé par la modération"} /> Motif : {pro.reports[i].reason}
              </p>
            ) : reporting?.i === i ? (
              <form
                className={p.replyForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  update((x) => ({ ...x, reports: { ...(x.reports ?? {}), [i]: { reason: reporting.reason, at: stamp(), status: "Signalé" } } }));
                  setReporting(null);
                }}
              >
                <label className="field">
                  Motif du signalement
                  <select value={reporting.reason} onChange={(e) => setReporting({ i, reason: e.target.value })}>
                    {REPORT_REASONS.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <p className={styles.small}>La modération Céleste examine l&apos;avis. Un avis négatif mais factuel reste publié : répondre est souvent plus utile.</p>
                <div className={p.builderActions}>
                  <button type="submit" className="btn btn-sm btn-outline">
                    Envoyer le signalement
                  </button>
                  <button type="button" className={p.textBtn} onClick={() => setReporting(null)}>
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <button type="button" className={p.textBtn} onClick={() => setReporting({ i, reason: REPORT_REASONS[0] })}>
                Signaler cet avis
              </button>
            )}
            {pro.replies[i] ? (
              <p className={p.reply}>
                <b>Votre réponse</b> {pro.replies[i]}
              </p>
            ) : (
              <form
                className={p.replyForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  const text = (drafts[i] ?? "").trim();
                  if (text) update((x) => ({ ...x, replies: { ...x.replies, [i]: text } }));
                }}
              >
                <label className="visually-hidden" htmlFor={`r-${i}`}>
                  Répondre à {r.author}
                </label>
                <textarea id={`r-${i}`} rows={2} placeholder="Remercier, apporter une précision…" value={drafts[i] ?? ""} onChange={(e) => setDrafts((d) => ({ ...d, [i]: e.target.value }))} />
                <button type="submit" className="btn btn-sm btn-outline" disabled={!(drafts[i] ?? "").trim()}>
                  Publier la réponse
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
