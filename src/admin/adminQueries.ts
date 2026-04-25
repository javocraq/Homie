import { supabase } from '../lib/supabase';
import type {
  BlogAuthor,
  BlogCategory,
  BlogPost,
  BlogPostStatus,
  BlogPostWithRelations,
} from '../types/blog';

function db() {
  if (!supabase) throw new Error('Supabase no está configurado.');
  return supabase;
}

const ADMIN_POST_SELECT = `
  *,
  author:blog_authors!blog_posts_author_id_fkey(*),
  category:blog_categories!blog_posts_category_id_fkey(*)
`;

export async function listAllPosts(): Promise<BlogPostWithRelations[]> {
  const { data, error } = await db()
    .from('blog_posts')
    .select(ADMIN_POST_SELECT)
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as BlogPostWithRelations[];
}

export async function getPostById(id: string): Promise<BlogPostWithRelations | null> {
  const { data, error } = await db()
    .from('blog_posts')
    .select(ADMIN_POST_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as BlogPostWithRelations | null;
}

export async function listCategories(): Promise<BlogCategory[]> {
  const { data, error } = await db()
    .from('blog_categories')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as BlogCategory[];
}

export async function listAuthors(): Promise<BlogAuthor[]> {
  const { data, error } = await db()
    .from('blog_authors')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as BlogAuthor[];
}

export type PostDraft = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  cover_image_alt: string | null;
  author_id: string;
  category_id: string;
  tags: string[] | null;
  reading_time_minutes: number;
  status: BlogPostStatus;
  published_at: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
};

export async function createPost(draft: PostDraft): Promise<BlogPost> {
  const { data, error } = await db()
    .from('blog_posts')
    .insert({
      slug: draft.slug,
      title: draft.title,
      excerpt: draft.excerpt,
      content: draft.content,
      cover_image_url: draft.cover_image_url,
      cover_image_alt: draft.cover_image_alt,
      author_id: draft.author_id,
      category_id: draft.category_id,
      tags: draft.tags,
      reading_time_minutes: draft.reading_time_minutes,
      status: draft.status,
      published_at: draft.published_at,
      meta_title: draft.meta_title,
      meta_description: draft.meta_description,
      og_image_url: draft.og_image_url,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as BlogPost;
}

export async function updatePost(id: string, draft: PostDraft): Promise<BlogPost> {
  const { data, error } = await db()
    .from('blog_posts')
    .update({
      slug: draft.slug,
      title: draft.title,
      excerpt: draft.excerpt,
      content: draft.content,
      cover_image_url: draft.cover_image_url,
      cover_image_alt: draft.cover_image_alt,
      author_id: draft.author_id,
      category_id: draft.category_id,
      tags: draft.tags,
      reading_time_minutes: draft.reading_time_minutes,
      status: draft.status,
      published_at: draft.published_at,
      meta_title: draft.meta_title,
      meta_description: draft.meta_description,
      og_image_url: draft.og_image_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as BlogPost;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await db().from('blog_posts').delete().eq('id', id);
  if (error) throw error;
}

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export async function uploadImage(file: File, folder = 'content'): Promise<string> {
  const supabase = db();
  const safeName = file.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-');
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const { error } = await supabase.storage
    .from('blog-images')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
  return data.publicUrl;
}

export function estimateReadingMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').length : 0;
  return Math.max(1, Math.round(words / 220));
}
