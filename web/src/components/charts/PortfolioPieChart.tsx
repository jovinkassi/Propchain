"use client";

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import styles from "./Charts.module.scss";

interface Holding {
  name: string;
  valueAed: number;
}

interface Props {
  holdings: Holding[];
}

const COLORS = ["#6c63ff", "#00d4aa", "#f7b731", "#fc5c65", "#45aaf2", "#a55eea"];

export function PortfolioPieChart({ holdings }: Props) {
  const total = holdings.reduce((sum, h) => sum + h.valueAed, 0);

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Portfolio Allocation</h3>
      <p className={styles.chartSubtitle}>Total: AED {total.toLocaleString()}</p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={holdings}
            dataKey="valueAed"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={55}
            paddingAngle={3}
          >
            {holdings.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`AED ${value.toLocaleString()}`, "Value"]}
            contentStyle={{ background: "#16213e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
          />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
