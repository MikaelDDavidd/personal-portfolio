-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.analytics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  visited_at timestamp with time zone NOT NULL DEFAULT now(),
  page_name text NOT NULL,
  session_id uuid NOT NULL,
  user_agent text,
  referrer text,
  screen_resolution text,
  language text,
  timezone text,
  is_mobile boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT analytics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.blog_comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blog_comments_pkey PRIMARY KEY (id),
  CONSTRAINT blog_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id)
);
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content_markdown text NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  publish_date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  image_urls ARRAY,
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  file_url text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  image_url text,
  CONSTRAINT certificates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.linkedin_posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_url text NOT NULL,
  embed_code text,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT linkedin_posts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  name text NOT NULL,
  title text NOT NULL,
  bio text,
  avatar_url text,
  email text,
  phone text,
  birthday date,
  location text,
  facebook_url text,
  github_url text,
  instagram_url text,
  linkedin_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.project_images (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_images_pkey PRIMARY KEY (id),
  CONSTRAINT project_images_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['applications'::text, 'web-development'::text, 'web-design'::text])),
  description_markdown text,
  image_url text,
  demo_url text,
  github_url text,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon_url text NOT NULL,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.skills (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  percentage integer NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  category text NOT NULL CHECK (category = ANY (ARRAY['programming'::text, 'languages'::text, 'tools'::text, 'frameworks'::text])),
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT skills_pkey PRIMARY KEY (id)
);
CREATE TABLE public.timeline_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type = ANY (ARRAY['education'::text, 'experience'::text])),
  title text NOT NULL,
  institution text NOT NULL,
  period text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT timeline_items_pkey PRIMARY KEY (id)
);