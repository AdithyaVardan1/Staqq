"use client";

import { useProgress } from "@/hooks/useProgress";
import { ProgressBar } from "@/components/ProgressBar";

interface ModuleProgressProps {
    path: string;
    moduleSlug: string;
    totalChapters: number;
}

export function ModuleProgress({
    path,
    moduleSlug,
    totalChapters,
}: ModuleProgressProps) {
    const { getCompletedCountForModule, isLoaded } = useProgress();

    if (!isLoaded) return null;

    const completed = getCompletedCountForModule(path, moduleSlug);

    return (
        <div style={{ marginBottom: "2rem" }}>
            <ProgressBar
                completed={completed}
                total={totalChapters}
                showLabel={true}
                size="md"
            />
        </div>
    );
}
