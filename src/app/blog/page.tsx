import Link from 'next/link';
import { createAdminClient } from '@/utils/supabase/admin';
import { ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import styles from './page.module.css';

export const revalidate = 300; // 5 min ISR

export const metadata = {
    title: 'Blog | Staqq - IPO Analysis & Market Insights',
    description: 'IPO GMP analysis, subscription tracking, composite scores, and weekly market roundups for Indian investors.',
};

async function getBlogPosts() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('blog_posts')
            .select('slug, title, description, category, published_at, updated_at, views')
            .order('updated_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('[Blog] Fetch error:', error.message);
            return [];
        }
        return data || [];
    } catch {
        return [];
    }
}

export default async function BlogPage() {
    const posts = await getBlogPosts();

    const ipoAnalysis = posts.filter(p => p.category === 'ipo-analysis');
    const roundups = posts.filter(p => p.category === 'weekly-roundup');

    return (
        <main className={styles.main}>
            <div className="container">
                <section className={styles.hero}>
                    <h1 className={styles.title}>IPO Analysis & Market Insights</h1>
                    <p className={styles.subtitle}>
                        Data-driven IPO analysis with GMP tracking, composite scores, and subscription breakdowns. Updated daily.
                    </p>
                </section>

                {roundups.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <TrendingUp size={18} /> Weekly Roundups
                        </h2>
                        <div className={styles.postGrid}>
                            {roundups.map(post => (
                                <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.postCard}>
                                    <span className={styles.badge}>Weekly</span>
                                    <h3 className={styles.postTitle}>{post.title}</h3>
                                    <p className={styles.postDesc}>{post.description}</p>
                                    <div className={styles.postMeta}>
                                        <Calendar size={12} />
                                        <span>{new Date(post.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <TrendingUp size={18} /> IPO Analysis
                    </h2>
                    {ipoAnalysis.length > 0 ? (
                        <div className={styles.postGrid}>
                            {ipoAnalysis.map(post => (
                                <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.postCard}>
                                    <span className={styles.badge}>Analysis</span>
                                    <h3 className={styles.postTitle}>{post.title}</h3>
                                    <p className={styles.postDesc}>{post.description}</p>
                                    <div className={styles.postMeta}>
                                        <Calendar size={12} />
                                        <span>{new Date(post.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        <ArrowRight size={12} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.empty}>No analysis posts yet. Check back soon.</p>
                    )}
                </section>
            </div>
        </main>
    );
}
