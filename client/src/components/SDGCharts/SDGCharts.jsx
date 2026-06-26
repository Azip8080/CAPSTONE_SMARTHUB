import { useState } from "react";
import styles from "./SDGCharts.module.css";

import DistributionChart from "./DistributionChart";
import ParticipationChart from "./ParticipationChart";
import TrendChart from "./TrendChart";

const RANGE_OPTIONS = [
  { label: "1 month", value: "1month" },
  { label: "3 months", value: "3months" },
  { label: "6 months", value: "6months" },
  { label: "1 year", value: "1year" },
  { label: "All time", value: "all" },
];

export default function SDGCharts() {
  const [range, setRange] = useState("6months");

  return (
    <section className={styles.sdgCharts}>
      <div className={styles.sdgChartsInner}>

        <div className={styles.chartsHeading}>
          <h2>SDG Analytics</h2>
          <p>
            Track progress across all 17 Sustainable Development Goals
          </p>
        </div>

        <div className={styles.chartsToolbar}>
          <p className={styles.chartsToolbarLabel}>
            Period
          </p>

          <div className={styles.rangePills}>
            {RANGE_OPTIONS.map((r) => (
              <button
                key={r.value}
                className={`${styles.rangePill} ${
                  range === r.value ? styles.active : ""
                }`}
                onClick={() => setRange(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <DistributionChart range={range} />

        <div className={styles.chartsRow}>
          <ParticipationChart range={range} />
          <TrendChart range={range} />
        </div>

      </div>
    </section>
  );
}