import type { Metrics } from "../../types/chat";
import styles from "../../app/page.module.css";

type MetricsPanelProps = {
  metrics: Metrics;
  error: string | null;
  loading: boolean;
};

const metricLabels: Array<{ key: keyof Metrics; label: string }> = [
  { key: "promptTokens", label: "Prompt Tokens" },
  { key: "completionTokens", label: "Completion Tokens" },
  { key: "totalTokens", label: "Total Tokens" },
  { key: "model", label: "Model" },
  { key: "responseTime", label: "Response Time" },
];

export function MetricsPanel({ metrics, error, loading }: MetricsPanelProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <div className={styles.sidebarHeading}>
          <div><p className={`${styles.kicker} ${styles.label}`}>Datos de sesión</p><h2 className={styles.sidebarTitle}>Métricas</h2></div>
          <div className={styles.clockIcon} aria-hidden="true">◷</div>
        </div>
        <div className={styles.metrics}>
          {metricLabels.map((metric, index) => {
            const value = metrics[metric.key];
            const displayValue = value === null || value === "" ? "—" : metric.key === "responseTime" ? `${value} ms` : value;
            return <div className={`${styles.metric} ${index === 2 ? styles.metricWide : ""}`} key={metric.key}><p className={styles.metricLabel}>{metric.label}</p><p className={styles.metricValue}>{displayValue}</p></div>;
          })}
        </div>
        <div className={styles.errorBox} role="alert" aria-live="polite">
          <div className={styles.errorContent}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
            <div><p className={styles.errorTitle}>Área de errores</p><p className={styles.errorText}>{error ?? "Los mensajes de error de la API aparecerán aquí."}</p></div>
          </div>
        </div>
        <div className={styles.status} aria-live="polite"><p className={styles.label}>Estado actual</p><p className={styles.statusText}><span className={styles.statusDot} /> {loading ? "Pensando..." : "Esperando tu mensaje"}</p></div>
      </div>
    </aside>
  );
}
