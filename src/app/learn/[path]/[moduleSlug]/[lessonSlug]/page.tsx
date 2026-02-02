import Link from "next/link";
import { notFound } from "next/navigation";
import { getModuleBySlug, modules } from "@/data/modules";
import styles from "./lesson.module.css";
import { MarkCompleteButton } from "@/components/MarkCompleteButton";

interface PageProps {
    params: Promise<{
        path: string;
        moduleSlug: string;
        lessonSlug: string;
    }>;
}

export default async function LessonPage({ params }: PageProps) {
    const { path: pathKey, moduleSlug, lessonSlug } = await params;

    // Verify the module and chapter exist in our data
    const module = getModuleBySlug(moduleSlug);
    if (!module || module.path !== pathKey) {
        notFound();
    }

    const chapter = module.chapters.find((c) => c.slug === lessonSlug);
    if (!chapter) {
        notFound();
    }

    // Navigation Logic
    const pathModules = modules.filter(m => m.path === pathKey).sort((a, b) => a.id - b.id);
    const currentModuleIndex = pathModules.findIndex(m => m.slug === moduleSlug);
    const currentChapterIndex = module.chapters.findIndex(c => c.slug === lessonSlug);

    let prevLesson = null;
    let nextLesson = null;

    // Prev
    if (currentChapterIndex > 0) {
        prevLesson = {
            moduleSlug: moduleSlug,
            chapter: module.chapters[currentChapterIndex - 1]
        };
    } else if (currentModuleIndex > 0) {
        const prevModule = pathModules[currentModuleIndex - 1];
        if (prevModule.chapters.length > 0) {
            prevLesson = {
                moduleSlug: prevModule.slug,
                chapter: prevModule.chapters[prevModule.chapters.length - 1]
            };
        }
    }

    // Next
    if (currentChapterIndex < module.chapters.length - 1) {
        nextLesson = {
            moduleSlug: moduleSlug,
            chapter: module.chapters[currentChapterIndex + 1]
        };
    } else if (currentModuleIndex < pathModules.length - 1) {
        const nextModule = pathModules[currentModuleIndex + 1];
        if (nextModule.chapters.length > 0) {
            nextLesson = {
                moduleSlug: nextModule.slug,
                chapter: nextModule.chapters[0]
            };
        }
    }

    let Content;
    try {
        // Dynamic import of MDX file
        const mdx = await import(
            `@/chapters/${pathKey}/${moduleSlug}/${lessonSlug}.mdx`
        );
        Content = mdx.default;
    } catch (error) {
        Content = null;
    }

    return (
        <main className={styles.lessonContainer}>
            <div className={styles.topNavigation}>
                <Link href={`/learn/${pathKey}/${moduleSlug}`} className={styles.backLink}>
                    Back to Chapters
                </Link>
            </div>

            <article className={styles.prose}>
                {Content ? (
                    <Content />
                ) : (
                    <>
                        <h1>{chapter.title}</h1>
                        <div className={styles.placeholder}>
                            <p>📝 This chapter is coming soon!</p>
                            <p>
                                Content file: <code>src/chapters/{pathKey}/{moduleSlug}/{lessonSlug}.mdx</code>
                            </p>
                        </div>
                    </>
                )}

                <div style={{ marginTop: '3rem', borderTop: '1px solid #2d3a5a', paddingTop: '2rem' }}>
                    <MarkCompleteButton
                        path={pathKey}
                        moduleSlug={moduleSlug}
                        chapterSlug={lessonSlug}
                    />
                </div>
            </article>

            <div className={styles.navigation}>
                {prevLesson ? (
                    <Link href={`/learn/${pathKey}/${prevLesson.moduleSlug}/${prevLesson.chapter.slug}`} className={styles.navButton}>
                        ← Previous: {prevLesson.chapter.title}
                    </Link>
                ) : (
                    <div />
                )}

                {nextLesson ? (
                    <Link href={`/learn/${pathKey}/${nextLesson.moduleSlug}/${nextLesson.chapter.slug}`} className={styles.navButton}>
                        Next: {nextLesson.chapter.title} →
                    </Link>
                ) : (
                    <div />
                )}
            </div>
        </main>
    );
}

// Generate static params for all chapters
export async function generateStaticParams() {
    const params: { path: string; moduleSlug: string; lessonSlug: string }[] = [];

    for (const module of modules) {
        for (const chapter of module.chapters) {
            params.push({
                path: module.path,
                moduleSlug: module.slug,
                lessonSlug: chapter.slug,
            });
        }
    }

    return params;
}
