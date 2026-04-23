export type BlogCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type BlogAuthor = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
};

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export type BlogPost = {
  id: string;
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
  views_count: number;
  created_at: string;
  updated_at: string;
};

export type BlogPostWithRelations = BlogPost & {
  author: BlogAuthor;
  category: BlogCategory;
};

export type OwnerTestimonialRow = {
  id: string;
  name: string;
  location: string;
  photo_url: string;
  photo_alt: string | null;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  occupation_rate: number | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GuestTestimonialRow = {
  id: string;
  name: string;
  country: string;
  photo_url: string | null;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  stay_district: string | null;
  published_at: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
