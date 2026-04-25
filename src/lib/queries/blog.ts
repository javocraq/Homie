import { supabase, hasSupabase } from '../supabase';
import { mockCategories, mockPosts } from '../mocks/blog';
import type {
  BlogCategory,
  BlogPostWithRelations,
} from '../../types/blog';

export type PostListParams = {
  page?: number;
  pageSize?: number;
  categorySlug?: string | null;
};

export type PostListResult = {
  posts: BlogPostWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

const POST_SELECT = `
  *,
  author:blog_authors!blog_posts_author_id_fkey(*),
  category:blog_categories!blog_posts_category_id_fkey(*)
`;

export async function getPublishedPosts({
  page = 1,
  pageSize = 9,
  categorySlug,
}: PostListParams = {}): Promise<PostListResult> {
  if (!hasSupabase || !supabase) {
    let filtered = [...mockPosts].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
    if (categorySlug && categorySlug !== 'all') {
      filtered = filtered.filter((p) => p.category.slug === categorySlug);
    }
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const posts = filtered.slice(start, start + pageSize);
    return { posts, total, page, pageSize, hasMore: start + posts.length < total };
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('blog_posts')
    .select(POST_SELECT, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (categorySlug && categorySlug !== 'all') {
    const { data: cat } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (cat?.id) query = query.eq('category_id', cat.id);
    else return { posts: [], total: 0, page, pageSize, hasMore: false };
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  const posts = (data ?? []) as unknown as BlogPostWithRelations[];
  const total = count ?? 0;
  return { posts, total, page, pageSize, hasMore: from + posts.length < total };
}

export async function getPostBySlug(slug: string): Promise<BlogPostWithRelations | null> {
  if (!hasSupabase || !supabase) {
    return mockPosts.find((p) => p.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .select(POST_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as BlogPostWithRelations | null;
}

export async function getRelatedPosts(
  postId: string,
  categoryId: string,
  limit = 3,
): Promise<BlogPostWithRelations[]> {
  if (!hasSupabase || !supabase) {
    return mockPosts
      .filter((p) => p.category.id === categoryId && p.id !== postId)
      .slice(0, limit);
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', postId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as BlogPostWithRelations[];
}

export async function getAllCategories(): Promise<BlogCategory[]> {
  if (!hasSupabase || !supabase) return mockCategories;

  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as BlogCategory[];
}

export async function getAllSlugs(): Promise<string[]> {
  if (!hasSupabase || !supabase) return mockPosts.map((p) => p.slug);

  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');
  if (error) throw error;
  return (data ?? []).map((row) => row.slug as string);
}
