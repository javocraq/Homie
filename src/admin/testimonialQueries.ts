import { supabase } from '../lib/supabase';
import type { OwnerTestimonialRow, GuestTestimonialRow } from '../types/blog';

function db() {
  if (!supabase) throw new Error('Supabase no está configurado.');
  return supabase;
}

// ── Owner testimonials ────────────────────────────────────────────

export type OwnerDraft = {
  id?: string;
  name: string;
  location: string;
  photo_url: string;
  photo_alt: string | null;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  occupation_rate: number | null;
  display_order: number;
  is_active: boolean;
};

export async function listOwnerTestimonials(): Promise<OwnerTestimonialRow[]> {
  const { data, error } = await db()
    .from('owner_testimonials')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as OwnerTestimonialRow[];
}

export async function createOwnerTestimonial(draft: OwnerDraft): Promise<OwnerTestimonialRow> {
  const { data, error } = await db()
    .from('owner_testimonials')
    .insert({
      name: draft.name,
      location: draft.location,
      photo_url: draft.photo_url,
      photo_alt: draft.photo_alt,
      quote: draft.quote,
      rating: draft.rating,
      occupation_rate: draft.occupation_rate,
      display_order: draft.display_order,
      is_active: draft.is_active,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as OwnerTestimonialRow;
}

export async function updateOwnerTestimonial(
  id: string,
  draft: OwnerDraft
): Promise<OwnerTestimonialRow> {
  const { data, error } = await db()
    .from('owner_testimonials')
    .update({
      name: draft.name,
      location: draft.location,
      photo_url: draft.photo_url,
      photo_alt: draft.photo_alt,
      quote: draft.quote,
      rating: draft.rating,
      occupation_rate: draft.occupation_rate,
      display_order: draft.display_order,
      is_active: draft.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as OwnerTestimonialRow;
}

export async function deleteOwnerTestimonial(id: string): Promise<void> {
  const { error } = await db().from('owner_testimonials').delete().eq('id', id);
  if (error) throw error;
}

// ── Guest testimonials ────────────────────────────────────────────

export type GuestDraft = {
  id?: string;
  name: string;
  country: string;
  photo_url: string | null;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  stay_district: string | null;
  published_at: string | null; // ISO — extended on the DB side (see SQL)
  display_order: number;
  is_active: boolean;
};

export type GuestTestimonialExtended = GuestTestimonialRow & {
  published_at?: string | null;
};

export async function listGuestTestimonials(): Promise<GuestTestimonialExtended[]> {
  const { data, error } = await db()
    .from('guest_testimonials')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as GuestTestimonialExtended[];
}

export async function createGuestTestimonial(draft: GuestDraft): Promise<GuestTestimonialExtended> {
  const { data, error } = await db()
    .from('guest_testimonials')
    .insert({
      name: draft.name,
      country: draft.country,
      photo_url: draft.photo_url,
      quote: draft.quote,
      rating: draft.rating,
      stay_district: draft.stay_district,
      published_at: draft.published_at,
      display_order: draft.display_order,
      is_active: draft.is_active,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as GuestTestimonialExtended;
}

export async function updateGuestTestimonial(
  id: string,
  draft: GuestDraft
): Promise<GuestTestimonialExtended> {
  const { data, error } = await db()
    .from('guest_testimonials')
    .update({
      name: draft.name,
      country: draft.country,
      photo_url: draft.photo_url,
      quote: draft.quote,
      rating: draft.rating,
      stay_district: draft.stay_district,
      published_at: draft.published_at,
      display_order: draft.display_order,
      is_active: draft.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as GuestTestimonialExtended;
}

export async function deleteGuestTestimonial(id: string): Promise<void> {
  const { error } = await db().from('guest_testimonials').delete().eq('id', id);
  if (error) throw error;
}

export async function bulkCreateGuestTestimonials(
  drafts: GuestDraft[]
): Promise<GuestTestimonialExtended[]> {
  if (drafts.length === 0) return [];
  const { data, error } = await db()
    .from('guest_testimonials')
    .insert(
      drafts.map((d) => ({
        name: d.name,
        country: d.country,
        photo_url: d.photo_url,
        quote: d.quote,
        rating: d.rating,
        stay_district: d.stay_district,
        published_at: d.published_at,
        display_order: d.display_order,
        is_active: d.is_active,
      }))
    )
    .select('*');
  if (error) throw error;
  return (data ?? []) as GuestTestimonialExtended[];
}

// ── Image upload (reuses blog-images bucket) ──────────────────────
export async function uploadTestimonialImage(file: File): Promise<string> {
  const sb = db();
  const safeName = file.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-');
  const path = `testimonials/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const { error } = await sb.storage
    .from('blog-images')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = sb.storage.from('blog-images').getPublicUrl(path);
  return data.publicUrl;
}
