import { supabase, hasSupabase } from '../supabase';
import { mockOwnerTestimonials, mockGuestTestimonials } from '../mocks/testimonials';
import type { OwnerTestimonialRow, GuestTestimonialRow } from '../../types/blog';

export async function getActiveOwnerTestimonials(): Promise<OwnerTestimonialRow[]> {
  if (!hasSupabase || !supabase) {
    return mockOwnerTestimonials
      .filter((t) => t.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }

  const { data, error } = await supabase
    .from('owner_testimonials')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as OwnerTestimonialRow[];
}

export async function getActiveGuestTestimonials(): Promise<GuestTestimonialRow[]> {
  if (!hasSupabase || !supabase) {
    return mockGuestTestimonials
      .filter((t) => t.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }

  const { data, error } = await supabase
    .from('guest_testimonials')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as GuestTestimonialRow[];
}
