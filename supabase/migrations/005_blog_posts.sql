-- Blog posts for SEO content
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'ipo-analysis',
    ipo_slug TEXT,
    published_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    views INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_ipo_slug ON blog_posts(ipo_slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);

-- Public read access, only service role can write
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts" ON blog_posts
    FOR SELECT USING (true);
