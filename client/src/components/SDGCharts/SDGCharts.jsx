
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

        <div className={styles.analyticsHeader}>
          <div className={styles.chartsHeading}>
            <span className={styles.sectionLabel}>
              CLIENT ANALYTICS
            </span>

            <h2>SDG Analytics</h2>

            <p>
              Monitor project distribution, SDG participation,
              and activity trends
              {barangay ? ` in ${barangay}` : " in your community"}.
            </p>
          </div>

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
                  range === option.value
                    ? styles.rangePillActive
                    : ""
                }`}
                onClick={() => setRange(option.value)}
                aria-pressed={range === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* FIRST: FULL-WIDTH DISTRIBUTION */}
        <DistributionChart
          range={range}
          barangay={barangay}
        />

        {/* SECOND: PARTICIPATION AND TREND SIDE BY SIDE */}
        <div className={styles.analyticsGrid}>
          <ParticipationChart
            range={range}
            barangay={barangay}
          />

          <TrendChart
            range={range}
            barangay={barangay}
          />
        </div>

      </div>
    </section>
  );
}