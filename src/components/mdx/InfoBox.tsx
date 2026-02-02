import styles from "./InfoBox.module.css";
import { ReactNode } from "react";

interface InfoBoxProps {
    type?: "note" | "tip" | "warning" | "important";
    title?: string;
    children: ReactNode;
}

const icons: Record<string, string> = {
    note: "📝",
    tip: "💡",
    warning: "⚠️",
    important: "❗",
};

const defaultTitles: Record<string, string> = {
    note: "Note",
    tip: "Tip",
    warning: "Warning",
    important: "Important",
};

export function InfoBox({ type = "note", title, children }: InfoBoxProps) {
    return (
        <div className={`${styles.infoBox} ${styles[type]}`}>
            <div className={styles.header}>
                <span className={styles.icon}>{icons[type]}</span>
                <span className={styles.title}>{title || defaultTitles[type]}</span>
            </div>
            <div className={styles.content}>{children}</div>
        </div>
    );
}
