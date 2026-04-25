import styles from "./DisclaimerBanner.module.css";

export default function DisclaimerBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.container}>
        <span className={styles.icon}>⚠️</span>
        <div className={styles.content}>
          <strong>Educational Purposes Only:</strong> This content is designed to help you understand financial markets. 
          Staqq is <strong>not a SEBI-registered investment advisor</strong>. 
          Investments in the securities market are subject to market risks. Read all related documents carefully before investing.
        </div>
      </div>
    </div>
  );
}
