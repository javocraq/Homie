import { supabase, hasSupabase } from '../supabase';

// ── Types ───────────────────────────────────────────────────────────────
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'archived';

export type LeadSource = 'hero_modal' | 'contact_form' | 'other';

export type LeadLang = 'es' | 'en';

/** Shape inserted from the public form. */
export type LeadInsert = {
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  address: string;
  sqm: string;
  bedrooms: string;
  bathrooms: string;
  guests: string;
  terms_accepted: boolean;
  source?: LeadSource;
  lang?: LeadLang;
  user_agent?: string | null;
  referrer?: string | null;
};

/** Full row as stored in Supabase (what the CMS reads). */
export type LeadRow = {
  id: string;
  created_at: string;
  updated_at: string;
  status: LeadStatus;
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  address: string;
  sqm: string;
  bedrooms: string;
  bathrooms: string;
  guests: string;
  terms_accepted: boolean;
  source: LeadSource;
  lang: LeadLang;
  user_agent: string | null;
  referrer: string | null;
  notes: string | null;
};

// ── Public submit (anon-friendly) ────────────────────────────────────────
/**
 * Insert a lead from the public projection modal. Returns the inserted row
 * or `null` when Supabase isn't configured (dev without env vars). In that
 * case callers should still continue — the Make.com webhook is the source
 * of truth in local dev.
 */
export async function submitLead(input: LeadInsert): Promise<LeadRow | null> {
  if (!hasSupabase || !supabase) return null;

  const payload = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    city: input.city.trim(),
    district: input.district.trim(),
    address: input.address.trim(),
    sqm: input.sqm,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    guests: input.guests,
    terms_accepted: input.terms_accepted,
    source: input.source ?? 'hero_modal',
    lang: input.lang ?? 'es',
    user_agent: input.user_agent ?? null,
    referrer: input.referrer ?? null,
  };

  const { data, error } = await supabase
    .from('homie_leads')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as LeadRow;
}

// ── CMS listing + mutations (authenticated) ──────────────────────────────
export async function listLeads(): Promise<LeadRow[]> {
  if (!hasSupabase || !supabase) return [];
  const { data, error } = await supabase
    .from('homie_leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as LeadRow[];
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<void> {
  if (!hasSupabase || !supabase) return;
  const { error } = await supabase
    .from('homie_leads')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function updateLeadNotes(
  id: string,
  notes: string,
): Promise<void> {
  if (!hasSupabase || !supabase) return;
  const { error } = await supabase
    .from('homie_leads')
    .update({ notes })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteLead(id: string): Promise<void> {
  if (!hasSupabase || !supabase) return;
  const { error } = await supabase
    .from('homie_leads')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
