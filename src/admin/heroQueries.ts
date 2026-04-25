import { supabase } from '../lib/supabase';

export const HERO_MAX_IMAGES = 10;

export type HeroImageRow = {
  id: string;
  image_url: string;
  image_alt: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type HeroImageDraft = {
  image_url: string;
  image_alt: string | null;
  display_order: number;
  is_active: boolean;
};

function db() {
  if (!supabase) throw new Error('Supabase no está configurado.');
  return supabase;
}

export async function listHeroImages(): Promise<HeroImageRow[]> {
  const { data, error } = await db()
    .from('hero_images')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as HeroImageRow[];
}

export async function listActiveHeroImages(): Promise<HeroImageRow[]> {
  const { data, error } = await db()
    .from('hero_images')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as HeroImageRow[];
}

export async function createHeroImage(draft: HeroImageDraft): Promise<HeroImageRow> {
  const { data, error } = await db()
    .from('hero_images')
    .insert({
      image_url: draft.image_url,
      image_alt: draft.image_alt,
      display_order: draft.display_order,
      is_active: draft.is_active,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as HeroImageRow;
}

export async function updateHeroImage(
  id: string,
  patch: Partial<HeroImageDraft>
): Promise<HeroImageRow> {
  const { data, error } = await db()
    .from('hero_images')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as HeroImageRow;
}

export async function deleteHeroImage(id: string): Promise<void> {
  const { error } = await db().from('hero_images').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderHeroImages(
  ordered: { id: string; display_order: number }[]
): Promise<void> {
  if (ordered.length === 0) return;
  await Promise.all(
    ordered.map(({ id, display_order }) =>
      db().from('hero_images').update({ display_order }).eq('id', id)
    )
  );
}

export async function uploadHeroImage(file: File): Promise<string> {
  const sb = db();
  const safeName = file.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-');
  const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const { error } = await sb.storage
    .from('blog-images')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = sb.storage.from('blog-images').getPublicUrl(path);
  return data.publicUrl;
}
