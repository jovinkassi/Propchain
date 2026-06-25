"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import styles from "./Charts.module.scss";

interface PropertyStat {
  name: string;
  yieldPct: number;
  valueAed: number;
}

interface Props {
  properties: PropertyStat[];
}

export function MarketBarChart({ properties }: Props) {
  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Property Yield Comparison</h3>
      <p className={styles.chartSubtitle}>Annual rental yield %</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={properties} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: "#a0a0b0", fontSize: 11 }} />
          <YAxis tick={{ fill: "#a0a0b0", fontSize: 12 }} unit="%" />
          <Tooltip
            formatter={(val: number) => [`${val}%`, "Annual Yield"]}
            contentStyle={{ background: "#16213e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
          />
          <Bar dataKey="yieldPct" radius={[6, 6, 0, 0]}>
            {properties.map((_, i) => (
              <Cell
                key={i}
                fill={i === 0 ? "#6c63ff" : i === 1 ? "#00d4aa" : "#f7b731"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
