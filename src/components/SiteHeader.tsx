import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" prefetch={false} aria-label="SURFBIT beach town">
          <BrandLogo />
        </Link>
        <Link href="/shop">Shop</Link>
      </nav>
    </header>
  );
}
