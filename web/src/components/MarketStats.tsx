"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchProperties } from "@/store/slices/propertiesSlice";
import styles from "./MarketStats.module.scss";

export function MarketStats() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.properties);

  useEffect(() => { dispatch(fetchProperties()); }, [dispatch]);

  const totalValue = items.reduce((sum, p) => sum + p.totalValue, 0);
  const avgYield = items.length
    ? (items.reduce((sum, p) => sum + p.rentalYieldBps, 0) / items.length / 100).toFixed(2)
    : "0.00";

  const stats = [
    { label: "Listed Properties", value: loading ? "—" : items.length.toString() },
    { label: "Total Market Value", value: loading ? "—" : `AED ${(totalValue / 1_000_000).toFixed(1)}M` },
    { label: "Avg. Annual Yield", value: loading ? "—" : `${avgYield}%` },
    { label: "Blockchain", value: "Ethereum + Arbitrum" },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.card}>
            <p className={styles.value}>{s.value}</p>
            <p className={styles.label}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
