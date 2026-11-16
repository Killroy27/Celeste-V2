import Image from "next/image";
import styles from "./Logo.module.css";

// Lockup validé : monogramme 30 px + logotype 22 px, espacés de 10 px.
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={styles.logo}>
      <Image src="/brand/monogram.png" alt="" width={29} height={30} priority className={styles.mark} />
      <Image
        src="/brand/wordmark.png"
        alt="Céleste"
        width={87}
        height={22}
        priority
        className={compact ? `${styles.word} ${styles.hideSmall}` : styles.word}
      />
    </span>
  );
}
