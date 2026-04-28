import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import { BlogHeroAnimator, BlogSectionAnimator, BlogGridAnimator } from '@/components/blog/BlogAnimators';
import styles from './page.module.css';

export const revalidate = 300; // 5 min ISR

export const metadata = {
    title: 'Blog | Staqq - IPO Analysis & Market Insights',
    description: 'IPO GMP analysis, subscription tracking, composite scores, and weekly market roundups for Indian investors.',
};

async function getBlogPosts() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
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

    const featuredPost = posts[0];
    const remainingPosts = posts.slice(1);

    const ipoAnalysis = remainingPosts.filter(p => p.category === 'ipo-analysis');
    const roundups = remainingPosts.filter(p => p.category === 'weekly-roundup');

    return (
        <main className={styles.main}>
            <div className={styles.bgGlow1} />
            <div className={styles.bgGlow2} />
            <div className="container">
                <BlogHeroAnimator>
                    <section className={styles.hero}>
                        <div className={styles.eyebrow}>The Staqq Journal</div>
                        <h1 className={styles.title}>IPO Analysis & Market Insights</h1>
                        <p className={styles.subtitle}>
                            Data-driven IPO analysis with GMP tracking, composite scores, and subscription breakdowns. Updated daily.
                        </p>
                    </section>
                </BlogHeroAnimator>

                {featuredPost && (
                    <BlogSectionAnimator delay={0.1}>
                        <section className={styles.featuredSection}>
                            <h2 className={styles.sectionTitle}>
                                <TrendingUp size={18} /> Latest Insight
                            </h2>
                            <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredCard}>
                                <div className={styles.featuredContent}>
                                    <div className={styles.featuredBadges}>
                                        <span className={styles.badge}>{featuredPost.category === 'weekly-roundup' ? 'Weekly' : 'Analysis'}</span>
                                        <span className={styles.badgeHighlight}>Featured</span>
                                    </div>
                                    <h3 className={styles.featuredTitle}>{featuredPost.title}</h3>
                                    <p className={styles.featuredDesc}>{featuredPost.description}</p>
                                    <div className={styles.postMeta}>
                                        <Calendar size={13} />
                                        <span>{new Date(featuredPost.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        <div className={styles.metaDivider} />
                                        <span>{featuredPost.views || 0} views</span>
                                    </div>
                                </div>
                                <div className={styles.featuredDeco}>
                                    <div className={styles.decoCircle1} />
                                    <div className={styles.decoCircle2} />
                                    <ArrowRight className={styles.featuredArrow} size={32} />
                                </div>
                            </Link>
                        </section>
                    </BlogSectionAnimator>
                )}

                {roundups.length > 0 && (
                    <BlogSectionAnimator delay={0.2}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <TrendingUp size={18} /> Weekly Roundups
                            </h2>
                            <BlogGridAnimator className={styles.postGrid}>
                                {roundups.map(post => (
                                    <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.postCard}>
                                        <span className={styles.badge}>Weekly</span>
                                        <h3 className={styles.postTitle}>{post.title}</h3>
                                        <p className={styles.postDesc}>{post.description}</p>
                                        <div className={styles.postMeta}>
                                            <Calendar size={12} />
                                            <span>{new Date(post.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            <div className={styles.metaDivider} />
                                            <span>{post.views || 0} views</span>
                                        </div>
                                    </Link>
                                ))}
                            </BlogGridAnimator>
                        </section>
                    </BlogSectionAnimator>
                )}

                <BlogSectionAnimator delay={0.3}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <TrendingUp size={18} /> IPO Analysis
                        </h2>
                        {ipoAnalysis.length > 0 ? (
                            <BlogGridAnimator className={styles.postGrid}>
                                {ipoAnalysis.map(post => (
                                    <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.postCard}>
                                        <span className={styles.badge}>Analysis</span>
                                        <h3 className={styles.postTitle}>{post.title}</h3>
                                        <p className={styles.postDesc}>{post.description}</p>
                                        <div className={styles.postMeta}>
                                            <Calendar size={12} />
                                            <span>{new Date(post.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            <div className={styles.metaDivider} />
                                            <span>{post.views || 0} views</span>
                                            <ArrowRight size={12} className="ml-auto" />
                                        </div>
                                    </Link>
                                ))}
                            </BlogGridAnimator>
                        ) : (
                            <p className={styles.empty}>No analysis posts yet. Check back soon.</p>
                        )}
                    </section>
                </BlogSectionAnimator>
            </div>
        </main>
    );
}
