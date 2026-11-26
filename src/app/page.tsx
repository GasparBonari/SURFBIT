import styles from "./page.module.css";

/**
 * Temporary brand placeholder. Roadmap step 1.3 replaces this with the
 * Phaser world (<WorldClient />) + HUD. See docs/ROADMAP.md.
 */

const SWATCHES = [
  ["Coral", "--sb-coral"],
  ["Teal", "--sb-teal"],
  ["Sun", "--sb-sun"],
  ["Sky", "--sb-sky"],
  ["Deep Blue", "--sb-deep-blue"],
  ["Sand", "--sb-sand"],
  ["Water", "--sb-water"],
  ["Grass", "--sb-grass"],
  ["Wood", "--sb-wood"],
  ["Ink", "--sb-ink"],
] as const;

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={`sb-panel ${styles.card}`}>
        <h1 className={`sb-pixel ${styles.logo}`}>SURFBIT</h1>
        <p className={styles.tagline}>More than a store. A world to explore.</p>
        <p className={styles.note}>
          The beach town is under construction. Follow{" "}
          <code>docs/ROADMAP.md</code> to build it.
        </p>
        <ul className={styles.swatches} aria-label="Brand palette">
          {SWATCHES.map(([name, token]) => (
            <li key={token}>
              <span
                className={styles.chip}
                style={{ background: `var(${token})` }}
              />
              <span className={styles.label}>{name}</span>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <button className="sb-btn" type="button" disabled>
            Enter the town
          </button>
          <button className="sb-btn sb-btn--secondary" type="button" disabled>
            Shop directly
          </button>
        </div>
      </section>
    </main>
  );
}
