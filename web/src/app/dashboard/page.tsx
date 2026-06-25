"use client";

import { useEffect } from "react";
import { YieldChart } from "@/components/charts/YieldChart";
import { PortfolioPieChart } from "@/components/charts/PortfolioPieChart";
import { MarketBarChart } from "@/components/charts/MarketBarChart";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchProperties } from "@/store/slices/propertiesSlice";
import { fetchPortfolio } from "@/store/slices/portfolioSlice";
import styles from "./dashboard.module.scss";

const yieldData = [
  { month: "Jan", yield: 2100, projected: 2000 },
  { month: "Feb", yield: 2200, projected: 2100 },
  { month: "Mar", yield: 2050, projected: 2150 },
  { month: "Apr", yield: 2300, projected: 2200 },
  { month: "May", yield: 2400, projected: 2250 },
  { month: "Jun", yield: 2350, projected: 2300 },
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { holdings, totalValueAed, loading: portfolioLoading } = useAppSelector((s) => s.portfolio);
  const { items: properties, loading: propsLoading } = useAppSelector((s) => s.properties);

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchPortfolio());
  }, [dispatch]);

  const marketProps = properties.map((p) => ({
    name: p.name.split(" ").slice(0, 2).join(" "),
    yieldPct: p.rentalYieldBps / 100,
    valueAed: p.totalValue,
  }));

  const stats = [
    { label: "Total Invested", value: `AED ${totalValueAed.toLocaleString()}` },
    { label: "Annual Yield", value: `AED ${Math.round(totalValueAed * 0.0585).toLocaleString()}` },
    { label: "Monthly Income", value: `AED ${Math.round((totalValueAed * 0.0585) / 12).toLocaleString()}` },
    { label: "Properties Owned", value: holdings.length.toString() },
  ];

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Portfolio Dashboard</h1>

      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <p className={styles.statLabel}>{s.label}</p>
            <p className={styles.statValue}>{portfolioLoading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.wide}>
          <YieldChart data={yieldData} propertyName="Portfolio" />
        </div>
        {holdings.length > 0 && (
          <PortfolioPieChart holdings={holdings.map((h) => ({ name: h.name, valueAed: h.valueAed }))} />
        )}
        {marketProps.length > 0 && !propsLoading && (
          <MarketBarChart properties={marketProps} />
        )}
      </div>
    </main>
  );
}
