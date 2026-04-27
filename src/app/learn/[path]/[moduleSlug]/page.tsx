import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getModuleBySlug, modules, getModulesByPath } from "@/data/modules";
import styles from "./module.module.css";
import { ModuleProgress } from "@/components/ModuleProgress";
import { ChapterStatus } from "@/components/ChapterStatus";
import { learnPaths } from "@/data/learnPaths";

interface PageProps {
    params: Promise<{
        path: string;
        moduleSlug: string;
    }>;
}

export default async function ModulePage({ params }: PageProps) {
    const { moduleSlug, path: pathKey } = await params;

    const module = getModuleBySlug(moduleSlug);
    if (!module || module.path !== pathKey) notFound();

    const pathModules = getModulesByPath(pathKey).sort((a, b) => a.id - b.id);
    const moduleNumber = pathModules.findIndex(m => m.slug === moduleSlug) + 1;
    const pathTitle = learnPaths[pathKey as keyof typeof learnPaths]?.title ?? pathKey;

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <Link href={`/learn/${pathKey}`} className={styles.backLink}>
                    <ArrowLeft strokeWidth={2.5} size={15} />
                    {pathTitle}
                </Link>

                <div className={styles.eyebrow}>Module {moduleNumber}</div>
                <h1 className={styles.title}>{module.title}</h1>

                {module.description && (
                    <p className={styles.description}>{module.description}</p>
                )}

                <div className={styles.progressWrap}>
                    <ModuleProgress
                        path={pathKey}
                        moduleSlug={moduleSlug}
                        totalChapters={module.chapters.length}
                    />
                </div>
            </div>

            <div className={styles.sectionLabel}>Lessons</div>

            <div className={styles.chaptersTimeline}>
                {module.chapters.map((chapter, index) => (
                    <Link
                        key={chapter.slug}
                        href={`/learn/${pathKey}/${moduleSlug}/${chapter.slug}`}
                        className={styles.chapterCard}
                    >
                        <ChapterTimelineNode index={index} />

                        <div className={styles.chapterContent}>
                            <h3 className={styles.chapterTitle}>{chapter.title}</h3>
                            <p className={styles.chapterMeta}>Read lesson →</p>
                        </div>

                        <ChapterStatus
                            path={pathKey}
                            moduleSlug={moduleSlug}
                            chapterSlug={chapter.slug}
                        />
                    </Link>
                ))}
            </div>
        </main>
    );
}

function ChapterTimelineNode({ index }: { index: number }) {
    return (
        <div className={`${styles.timelineNode} ${styles.nodeDefault}`}>
            {index + 1}
        </div>
    );
}

export async function generateStaticParams() {
    return modules.map((module) => ({
        path: module.path,
        moduleSlug: module.slug,
    }));
}
