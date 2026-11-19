"use client";

import { useState } from "react";
import { formatDay, stamp } from "@/lib/format";
import { canReview, REVIEW_CRITERIA, reviewOf, useWedding, vendorName, type Wedding } from "@/lib/wedding";
import { Modal, StatusChip } from "../../ui";
import styles from "../../espace.module.css";
import s from "./prestataires.module.css";

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

// Avis vérifié (CDC §24) : seulement après une prestation réservée et payée via Céleste, sur cinq critères.
// Le prestataire peut répondre publiquement ou signaler l'avis ; il ne peut pas le supprimer.
export function ReviewBlock({ w, slug }: { w: Wedding; slug: string }) {
  const review = reviewOf(w, slug);
  const eligible = canReview(w, slug);
  const [open, setOpen] = useState(false);
  if (!review && !eligible) return null;
  const avg = review ? Math.round((review.scores.reduce((a, b) => a + b, 0) / review.scores.length) * 10) / 10 : 0;

  return (
    <section className={s.block}>
      <h3 className={s.blockTitle}>Votre avis</h3>
      {review ? (
        <div className={s.review}>
          <div className={s.reviewTop}>
            <strong>{String(avg).replace(".", ",")} / 5</strong>
            <StatusChip status="Publié" />
          </div>
          <ul className={s.reviewScores}>
            {REVIEW_CRITERIA.map((c, i) => (
              <li key={c}>
                <span>{c}</span>
                <span aria-label={`${review.scores[i]} sur 5`}>{stars(review.scores[i])}</span>
              </li>
            ))}
          </ul>
          <p>« {review.text} »</p>
          <p className={styles.rowMeta}>Publié le {formatDay(review.at)} avec la mention « Réservation vérifiée ». {vendorName(slug)} peut y répondre.</p>
        </div>
      ) : (
        <>
          <p className={styles.rowMeta}>Prestation terminée : votre avis vérifié aide les autres couples à choisir.</p>
          <button type="button" className="btn btn-sm" onClick={() => setOpen(true)}>
            Donner mon avis
          </button>
          <ReviewDialog open={open} onClose={() => setOpen(false)} slug={slug} />
        </>
      )}
    </section>
  );
}

function ReviewDialog({ open, onClose, slug }: { open: boolean; onClose: () => void; slug: string }) {
  const { update, newId } = useWedding();
  const [scores, setScores] = useState<number[]>(REVIEW_CRITERIA.map(() => 0));
  const [text, setText] = useState("");
  const ready = scores.every((n) => n > 0) && text.trim().length >= 20;

  return (
    <Modal open={open} onClose={onClose} labelledBy="review-t">
      <form
        className={s.reviewForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (!ready) return;
          update((x) => ({ ...x, reviews: [...(x.reviews ?? []), { id: newId(), vendorSlug: slug, at: stamp(), scores, text: text.trim() }] }));
          onClose();
        }}
      >
        <h2 id="review-t" className={styles.sectionTitle}>
          Votre avis sur {vendorName(slug)}
        </h2>
        <p className={styles.rowMeta}>Réservé et payé via Céleste : votre avis sera publié avec la mention « Réservation vérifiée ».</p>
        {REVIEW_CRITERIA.map((c, i) => (
          <fieldset key={c} className={s.starField}>
            <legend>{c}</legend>
            <div className={s.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className={s.star} data-on={scores[i] >= n}>
                  <input
                    type="radio"
                    name={`c${i}`}
                    value={n}
                    checked={scores[i] === n}
                    onChange={() => setScores((x) => x.map((v, k) => (k === i ? n : v)))}
                    className="visually-hidden"
                  />
                  <span aria-hidden="true">★</span>
                  <span className="visually-hidden">
                    {n} sur 5
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <label className="field">
          Votre expérience
          <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ce qui vous a plu, ce qui pourrait être amélioré…" />
        </label>
        <p className={styles.small}>Décrivez la prestation de façon factuelle. Les propos injurieux ou hors sujet peuvent être retirés par la modération.</p>
        <div className={s.reviewActions}>
          <button type="submit" className="btn" disabled={!ready}>
            Publier mon avis
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Annuler
          </button>
        </div>
      </form>
    </Modal>
  );
}

