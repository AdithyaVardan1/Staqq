"use client";

import { useState } from "react";
import styles from "./Quiz.module.css";

interface QuizProps {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

export function Quiz({ question, options, correctIndex, explanation }: QuizProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleSelect = (index: number) => {
        if (showResult) return;
        setSelectedIndex(index);
    };

    const handleSubmit = () => {
        if (selectedIndex === null) return;
        setShowResult(true);
    };

    const handleReset = () => {
        setSelectedIndex(null);
        setShowResult(false);
    };

    const isCorrect = selectedIndex === correctIndex;

    return (
        <div className={styles.quizContainer}>
            <div className={styles.questionHeader}>
                <span className={styles.quizIcon}>❓</span>
                <span className={styles.quizLabel}>Quick Quiz</span>
            </div>

            <p className={styles.question}>{question}</p>

            <div className={styles.options}>
                {options.map((option, index) => {
                    let optionClass = styles.option;

                    if (showResult) {
                        if (index === correctIndex) {
                            optionClass = `${styles.option} ${styles.correct}`;
                        } else if (index === selectedIndex) {
                            optionClass = `${styles.option} ${styles.incorrect}`;
                        }
                    } else if (index === selectedIndex) {
                        optionClass = `${styles.option} ${styles.selected}`;
                    }

                    return (
                        <button
                            key={index}
                            className={optionClass}
                            onClick={() => handleSelect(index)}
                            disabled={showResult}
                        >
                            <span className={styles.optionLetter}>
                                {String.fromCharCode(65 + index)}
                            </span>
                            <span className={styles.optionText}>{option}</span>
                        </button>
                    );
                })}
            </div>

            {showResult && explanation && (
                <div className={isCorrect ? styles.successBox : styles.errorBox}>
                    <span className={styles.resultIcon}>{isCorrect ? "✅" : "💡"}</span>
                    <p>{explanation}</p>
                </div>
            )}

            <div className={styles.actions}>
                {!showResult ? (
                    <button
                        className={styles.submitBtn}
                        onClick={handleSubmit}
                        disabled={selectedIndex === null}
                    >
                        Check Answer
                    </button>
                ) : (
                    <button className={styles.resetBtn} onClick={handleReset}>
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}
