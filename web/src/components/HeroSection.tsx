"use client";

import Link from "next/link";
import styles from "./HeroSection.module.scss";

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <span className={styles.badge}>UAE Real Estate on Blockchain</span>
        <h1 className={styles.title}>
          Invest in Dubai Properties <br />
          <span className={styles.highlight}>From AED 1</span>
        </h1>
        <p className={styles.subtitle}>
          Fractional ownership of premium UAE real estate. Earn rental yield,
          trade tokens, and access DeFi — all on-chain.
        </p>
        <div className={styles.actions}>
          <Link href="/properties" className="btn btn-primary">Browse Properties</Link>
          <Link href="/dashboard" className="btn btn-outline">View Dashboard</Link>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}><strong>AED 6.8M+</strong><span>Total Value Locked</span></div>
          <div className={styles.stat}><strong>3</strong><span>Properties Listed</span></div>
          <div className={styles.stat}><strong>6.0%</strong><span>Avg. Annual Yield</span></div>
        </div>
      </div>
    </section>
  );
}
