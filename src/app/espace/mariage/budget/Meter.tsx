import { euros } from "@/lib/wedding";
import b from "./budget.module.css";

// Barre segmentée sur une piste (méthode dataviz : « meter ») : la piste représente la limite (budget total
// ou montant prévu), les segments ce qui est payé puis engagé, dans une seule rampe neutre (payé = le plus foncé).
// Le jaune reste réservé au Best Match (docs/direction-artistique.md §3.3).
export type Segment = { label: string; value: number; tone: "paid" | "engaged" };

export function Meter({ segments, max, label, size = "md" }: { segments: Segment[]; max: number; label: string; size?: "md" | "lg" }) {
  const total = Math.max(max, segments.reduce((s, x) => s + x.value, 0), 1);
  const visible = segments.filter((s) => s.value > 0);
  return (
    // Le nom accessible résume toute la barre : aucune valeur ne dépend du survol (la vue tableau la reprend aussi).
    <div className={`${b.track} ${size === "lg" ? b.trackLg : ""}`} role="img" aria-label={label}>
      {visible.map((s) => (
        <span key={s.label} className={`${b.seg} ${b[s.tone]}`} style={{ width: `${(s.value / total) * 100}%` }} tabIndex={0} aria-label={`${s.label} : ${euros(s.value)}`}>
          <span className={b.tip} role="tooltip">
            <strong>{euros(s.value)}</strong>
            <span>{s.label}</span>
          </span>
        </span>
      ))}
    </div>
  );
}

export function MeterLegend() {
  return (
    <ul className={b.legend} aria-label="Légende">
      <li>
        <span className={`${b.key} ${b.paid}`} /> Payé
      </li>
      <li>
        <span className={`${b.key} ${b.engaged}`} /> Engagé, reste à payer
      </li>
      <li>
        <span className={`${b.key} ${b.keyTrack}`} /> Prévu ou disponible
      </li>
    </ul>
  );
}
