
import { useState } from "react";
import styles from "./SDGCharts.module.css";
import DistributionChart from "./DistributionChart";
import ParticipationChart from "./ParticipationChart";
import TrendChart from "./TrendChart";

const RANGE_OPTIONS = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
];

export default function SDGCharts({ barangay = "" }) {
  const [range, setRange] = useState("monthly");

  return (
    <section className={styles.sdgCharts}>
      <div className={styles.sdgChartsInner}>
        <div className={styles.chartsHeading}>
          <h2>SDG Analytics</h2>
          <p>
            Track SDG progress and project activity
            {barangay ? ` in ${barangay}` : " in your community"}.
          </p>
        </div>

        <div className={styles.chartsToolbar}>
          <p className={styles.chartsToolbarLabel}>Period</p>

          <div
            className={styles.rangePills}
            role="group"
            aria-label="Select analytics period"
          >
            {RANGE_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`${styles.rangePill} ${
                  range === option.value ? styles.active : ""
                }`}
                onClick={() => setRange(option.value)}
                aria-pressed={range === option.value}
              >
                {option.label}
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
