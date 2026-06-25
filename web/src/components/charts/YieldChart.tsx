"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import styles from "./Charts.module.scss";

interface YieldDataPoint {
  month: string;
  yield: number;
  projected: number;
}

interface Props {
  data: YieldDataPoint[];
  propertyName: string;
}

export function YieldChart({ data, propertyName }: Props) {
  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Yield Over Time — {propertyName}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={{ fill: "#a0a0b0", fontSize: 12 }} />
          <YAxis tick={{ fill: "#a0a0b0", fontSize: 12 }} unit=" AED" />
          <Tooltip
            contentStyle={{ background: "#16213e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
            labelStyle={{ color: "#e0e0e0" }}
          />
          <Legend />
          <Line type="monotone" dataKey="yield" stroke="#6c63ff" strokeWidth={2} dot={false} name="Actual Yield" />
          <Line type="monotone" dataKey="projected" stroke="#00d4aa" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Projected" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
