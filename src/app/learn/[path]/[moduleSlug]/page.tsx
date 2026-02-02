import Link from "next/link";
import { notFound } from "next/navigation";
import { getModuleBySlug, modules } from "@/data/modules";
import styles from "./module.module.css";
import { ModuleProgress } from "@/components/ModuleProgress";
import { ChapterStatus } from "@/components/ChapterStatus";

interface PageProps {
    params: Promise<{
        path: string;
        moduleSlug: string;
    }>;
}

export default async function ModulePage({ params }: PageProps) {
    const { moduleSlug, path: pathKey } = await params;

    const module = getModuleBySlug(moduleSlug);

    if (!module || module.path !== pathKey) {
        notFound();
    }

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <Link href={`/learn/${pathKey}`} className={styles.backLink}>
                    Back to Modules
                </Link>
                <h1 className={styles.title}>{module.title}</h1>
                {module.description && (
                    <p className={styles.description}>{module.description}</p>
                )}

                <div style={{ marginTop: '1.5rem' }}>
                    <ModuleProgress
                        path={pathKey}
                        moduleSlug={moduleSlug}
                        totalChapters={module.chapters.length}
                    />
                </div>
            </div>

            <div className={styles.chaptersGrid}>
                {module.chapters.map((chapter, index) => (
                    <Link
                        key={chapter.slug}
                        href={`/learn/${pathKey}/${moduleSlug}/${chapter.slug}`}
                        className={styles.chapterCard}
                    >
                        <span className={styles.chapterNumber}>{index + 1}</span>
                        <div className={styles.chapterContent}>
                            <h3 className={styles.chapterTitle}>{chapter.title}</h3>
                            <p className={styles.chapterCta}>Start reading →</p>
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

// Generate static params for all modules
export async function generateStaticParams() {
    return modules.map((module) => ({
        path: module.path,
        moduleSlug: module.slug,
    }));
}
