"use client";

import { useState } from "react";
import styles from "./CodePlayground.module.css";

interface CodePlaygroundProps {
    code: string;
    language?: string;
    title?: string;
    editable?: boolean;
}

export function CodePlayground({
    code,
    language = "javascript",
    title,
    editable = false,
}: CodePlaygroundProps) {
    const [currentCode, setCurrentCode] = useState(code);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(currentCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.playground}>
            <div className={styles.header}>
                <div className={styles.dots}>
                    <span className={styles.dot} style={{ background: "#ff5f56" }}></span>
                    <span className={styles.dot} style={{ background: "#ffbd2e" }}></span>
                    <span className={styles.dot} style={{ background: "#27c93f" }}></span>
                </div>
                {title && <span className={styles.title}>{title}</span>}
                <span className={styles.language}>{language}</span>
                <button className={styles.copyBtn} onClick={handleCopy}>
                    {copied ? "✓ Copied" : "Copy"}
                </button>
            </div>

            {editable ? (
                <textarea
                    className={styles.codeArea}
                    value={currentCode}
                    onChange={(e) => setCurrentCode(e.target.value)}
                    spellCheck={false}
                />
            ) : (
                <pre className={styles.codeBlock}>
                    <code>{currentCode}</code>
                </pre>
            )}
        </div>
    );
}
