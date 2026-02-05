import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
    completed: number;
    total: number;
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
}

export function ProgressBar({
    completed,
    total,
    showLabel = true,
    size = "md",
}: ProgressBarProps) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className={`${styles.container} ${styles[size]}`}>
            <div className={styles.barWrapper}>
                <div className={styles.barBackground}>
                    <div
                        className={styles.barFill}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
            {showLabel && (
                <span className={styles.label}>
                    {completed}/{total} completed
                </span>
            )}
        </div>
    );
}
