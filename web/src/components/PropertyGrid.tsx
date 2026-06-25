"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchProperties } from "@/store/slices/propertiesSlice";
import styles from "./PropertyGrid.module.scss";

export function PropertyGrid() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.properties);

  useEffect(() => { dispatch(fetchProperties()); }, [dispatch]);

  if (loading) return <div className={styles.loading}>Loading properties...</div>;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Featured Properties</h2>
      <div className={styles.grid}>
        {items.map((property) => (
          <Link key={property.id} href={`/properties/${property.onChainId ?? property.id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
              <div className={styles.imagePlaceholder}>🏙️</div>
              <span className={styles.yieldBadge}>
                {(property.rentalYieldBps / 100).toFixed(1)}% Yield
              </span>
            </div>
            <div className={styles.body}>
              <h3 className={styles.name}>{property.name}</h3>
              <p className={styles.location}>📍 {property.location}</p>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Value</span>
                  <span className={styles.statValue}>
                    AED {(property.totalValue / 1_000_000).toFixed(1)}M
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Token Price</span>
                  <span className={styles.statValue}>AED 1</span>
                </div>
              </div>
              <div className={styles.investBtn}>Invest Now →</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
