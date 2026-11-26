import Link from "next/link";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" prefetch={false} className={`sb-pixel ${styles.brand}`} aria-label="SURFBIT beach town">
          SURFBIT
        </Link>
        <Link href="/shop">Shop</Link>
      </nav>
    </header>
  );
}
