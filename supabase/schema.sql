-- ==============================================================================
-- Schema for Ly Kuongkeat's Personal Tech Blog & CV
-- Database: PostgreSQL / Supabase
-- Description: Tables, indexes, triggers, public.is_admin() function, 
--              Row Level Security (RLS) policies, and seed data.
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. Table: profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. Function: public.is_admin()
-- Evaluates if current authenticated user has is_admin = true in profiles table
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- ------------------------------------------------------------------------------
-- 4. Trigger to automatically create a profile when user signs up in auth.users
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    -- Optionally auto-grant admin to the first created profile or user email
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, FALSE)
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 5. Table: categories
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. Table: tags
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. Table: posts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  content_format TEXT NOT NULL DEFAULT 'markdown', -- 'markdown' or 'html'
  cover_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',            -- 'draft' or 'published'
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  views INTEGER NOT NULL DEFAULT 0,
  reading_time INTEGER NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. Table: post_tags (junction table)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ------------------------------------------------------------------------------
-- 9. Table: comments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. Table: ads
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slot TEXT NOT NULL,        -- 'header', 'sidebar_top', 'sidebar_bottom', 'in_article', 'below_post', 'footer'
  ad_type TEXT NOT NULL,     -- 'image' or 'script'
  image_url TEXT,
  link_url TEXT,
  script_code TEXT,
  width INTEGER,
  height INTEGER,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------------------------
-- 11. Table: media
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  object_key TEXT NOT NULL,
  public_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. Table: cv_sections
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cv_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  title TEXT NOT NULL,
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------------------------
-- 13. Table: cv_items
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cv_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.cv_sections(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  subtitle TEXT,
  url TEXT,
  position INTEGER NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------------------------
-- 14. Table: site_settings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 15. Table: subscribers
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 16. Table: contact_messages
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status_published_at ON public.posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_approved ON public.comments(post_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_ads_slot_active ON public.ads(slot, is_active);
CREATE INDEX IF NOT EXISTS idx_cv_sections_position ON public.cv_sections(position);
CREATE INDEX IF NOT EXISTS idx_cv_items_section_pos ON public.cv_items(section_id, position);

-- ==============================================================================
-- HELPER RPCs (Increments for views and ad statistics)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.increment_post_views(p_post_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.posts
  SET views = views + 1
  WHERE id = p_post_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_ad_impressions(p_ad_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.ads
  SET impressions = impressions + 1
  WHERE id = p_ad_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_ad_clicks(p_ad_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.ads
  SET clicks = clicks + 1
  WHERE id = p_ad_id;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by public"
  ON public.profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update own profile or admin can update all"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- 2. categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admin can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can update categories"
  ON public.categories FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete categories"
  ON public.categories FOR DELETE
  USING (public.is_admin());

-- 3. tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admin can insert tags"
  ON public.tags FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can update tags"
  ON public.tags FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete tags"
  ON public.tags FOR DELETE
  USING (public.is_admin());

-- 4. posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are viewable by public, all by admin"
  ON public.posts FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "Only admin can insert posts"
  ON public.posts FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can update posts"
  ON public.posts FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete posts"
  ON public.posts FOR DELETE
  USING (public.is_admin());

-- 5. post_tags
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post tags are viewable by everyone"
  ON public.post_tags FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admin can insert post tags"
  ON public.post_tags FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can update post tags"
  ON public.post_tags FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete post tags"
  ON public.post_tags FOR DELETE
  USING (public.is_admin());

-- 6. comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved comments are viewable by public, all by admin"
  ON public.comments FOR SELECT
  USING (is_approved = TRUE OR public.is_admin());

CREATE POLICY "Public can insert comments but unapproved by default"
  ON public.comments FOR INSERT
  WITH CHECK (
    -- Public cannot submit pre-approved comments; only admins can
    (is_approved = FALSE) OR public.is_admin()
  );

CREATE POLICY "Only admin can update comments"
  ON public.comments FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete comments"
  ON public.comments FOR DELETE
  USING (public.is_admin());

-- 7. ads
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active ads in valid date range, admin views all"
  ON public.ads FOR SELECT
  USING (
    public.is_admin()
    OR (
      is_active = TRUE
      AND (starts_at IS NULL OR starts_at <= NOW())
      AND (ends_at IS NULL OR ends_at >= NOW())
    )
  );

CREATE POLICY "Only admin can insert ads"
  ON public.ads FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can update ads"
  ON public.ads FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete ads"
  ON public.ads FOR DELETE
  USING (public.is_admin());

-- 8. media
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can view media list"
  ON public.media FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Only admin can insert media"
  ON public.media FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can update media"
  ON public.media FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete media"
  ON public.media FOR DELETE
  USING (public.is_admin());

-- 9. cv_sections
ALTER TABLE public.cv_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view visible cv sections, admin sees all"
  ON public.cv_sections FOR SELECT
  USING (is_visible = TRUE OR public.is_admin());

CREATE POLICY "Only admin can insert cv sections"
  ON public.cv_sections FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can update cv sections"
  ON public.cv_sections FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete cv sections"
  ON public.cv_sections FOR DELETE
  USING (public.is_admin());

-- 10. cv_items
ALTER TABLE public.cv_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view cv items for visible sections"
  ON public.cv_items FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.cv_sections s
      WHERE s.id = cv_items.section_id AND s.is_visible = TRUE
    )
  );

CREATE POLICY "Only admin can insert cv items"
  ON public.cv_items FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can update cv items"
  ON public.cv_items FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete cv items"
  ON public.cv_items FOR DELETE
  USING (public.is_admin());

-- 11. site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings viewable by everyone"
  ON public.site_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admin can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete site settings"
  ON public.site_settings FOR DELETE
  USING (public.is_admin());

-- 12. subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can view subscribers"
  ON public.subscribers FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Anyone can subscribe"
  ON public.subscribers FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Only admin can update subscribers"
  ON public.subscribers FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete subscribers"
  ON public.subscribers FOR DELETE
  USING (public.is_admin());

-- 13. contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Only admin can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete contact messages"
  ON public.contact_messages FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- SEED DATA: CATEGORIES
-- ==============================================================================
INSERT INTO public.categories (name, slug, description)
VALUES
  ('Web Development', 'web-development', 'Modern front-end engineering, React, Vite, CSS architectures, and performance optimization.'),
  ('JavaScript & TypeScript', 'javascript-typescript', 'Deep dives into ECMAScript standards, TypeScript design patterns, and runtime mechanics.'),
  ('Backend & Cloud', 'backend-cloud', 'Serverless APIs, Cloudflare Workers, PostgreSQL, microservices, and database tuning.'),
  ('Real-World Problem Solving', 'real-world-problem-solving', 'Case studies, architectural trade-offs, debugging stories, and production war-stories.'),
  ('DevOps & Tooling', 'devops-tooling', 'CI/CD pipelines, developer experience, automated testing, and infrastructure as code.')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ==============================================================================
-- SEED DATA: DEFAULT SITE SETTINGS
-- ==============================================================================
INSERT INTO public.site_settings (key, value)
VALUES
  ('general', '{
    "site_title": "Ly Kuongkeat",
    "tagline": "Software Engineer & Web Developer — writing about real-world code and engineering",
    "author_name": "Ly Kuongkeat",
    "author_title": "Senior Software Engineer",
    "author_bio": "Passionate about full-stack web engineering, resilient architectures, and sharing lessons learned from shipping production systems.",
    "author_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "cv_pdf_url": "",
    "social_github": "https://github.com",
    "social_linkedin": "https://linkedin.com",
    "social_twitter": "https://twitter.com"
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;
