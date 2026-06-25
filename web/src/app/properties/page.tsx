"use client";

import { PropertyGrid } from "@/components/PropertyGrid";
import styles from "./properties.module.scss";

export default function PropertiesPage() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Property Marketplace</h1>
        <p className={styles.subtitle}>
          Invest in tokenized UAE real estate from AED 1 per token
        </p>
      </div>
      <PropertyGrid />
    </main>
  );
}
