"use client";

import { useProgress } from "@/hooks/useProgress";

interface ChapterStatusProps {
    path: string;
    moduleSlug: string;
    chapterSlug: string;
}

export function ChapterStatus({
    path,
    moduleSlug,
    chapterSlug,
}: ChapterStatusProps) {
    const { isLessonComplete, isLoaded } = useProgress();

    if (!isLoaded) return null;

    const isComplete = isLessonComplete(path, moduleSlug, chapterSlug);

    if (!isComplete) return null;

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                background: "#4ade80",
                borderRadius: "50%",
                color: "#000",
                fontSize: "14px",
                marginLeft: "auto",
            }}
            title="Completed"
        >
            ✓
        </span>
    );
}
