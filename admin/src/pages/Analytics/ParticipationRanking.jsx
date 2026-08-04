import { useState, useEffect } from "react";
import styles from "./ParticipationRanking.module.css";
import { api } from "../../services/api";

function ParticipationRanking({ range }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/analytics/participation?range=${range}`)
      .then((d) => setData(d.data ?? []))
      .finally(() => setLoading(false));
  }, [range]);

  const total = data.reduce((s, d) => s + d.count, 0);
  const isEmpty = !loading && data.length === 0;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHead}>
        <p className={styles.chartEyebrow}>Participation</p>
        <p className={styles.chartTitle}>Top 3 SDG Participation</p>
      </div>

      {loading && <p className={styles.chartEmpty}>Loading…</p>}

      {isEmpty && (
        <div className={styles.chartEmpty}>
          <p>No data yet.</p>
          <p className={styles.chartEmptySub}>The top SDGs by project count will show up here.</p>
        </div>
      )}

      {!loading && !isEmpty && (
        <div className={styles.list}>
          {data.map((d, i) => {
            const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
            return (
              <div className={styles.row} key={d.tag}>
                <span className={`${styles.rank} ${styles[`rank${i + 1}`] || ""}`}>{i + 1}</span>
                <div className={styles.rowMain}>
                  <div className={styles.rowTop}>
                    <span className={styles.rowLabel}>
                      <span className={styles.rowDot} style={{ background: d.color }} />
                      {d.label}
                    </span>
                    <span className={styles.rowPercent}>{pct}%</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${pct}%`, background: d.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ParticipationRanking;