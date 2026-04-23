#!/usr/bin/env node
/**
 * Regenerates public/sitemap.xml at build time:
 *  - static URLs (home, distritos, legal, blog index)
 *  - one entry per published blog post (from Supabase, if configured)
 *
 * Runs as npm `prebuild` hook. Never fails the build — if Supabase is
 * unreachable, we keep the static URLs and log a warning.
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SITE = 'https://homiebnb.com';
const OUTPUT = join(process.cwd(), 'public', 'sitemap.xml');

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

const today = new Date().toISOString().slice(0, 10);

const staticUrls = [
  { loc: `${SITE}/`,                                      lastmod: today, changefreq: 'weekly',  priority: '1.0' },
  { loc: `${SITE}/blog`,                                   lastmod: today, changefreq: 'weekly',  priority: '0.7' },
  { loc: `${SITE}/sobre-nosotros`,                         lastmod: today, changefreq: 'monthly', priority: '0.7' },
  { loc: `${SITE}/administracion-airbnb-miraflores`,       lastmod: today, changefreq: 'monthly', priority: '0.9' },
  { loc: `${SITE}/administracion-airbnb-barranco`,         lastmod: today, changefreq: 'monthly', priority: '0.9' },
  { loc: `${SITE}/administracion-airbnb-san-isidro`,       lastmod: today, changefreq: 'monthly', priority: '0.9' },
  { loc: `${SITE}/administracion-airbnb-magdalena-del-mar`, lastmod: today, changefreq: 'monthly', priority: '0.9' },
  { loc: `${SITE}/privacidad`,                             lastmod: today, changefreq: 'yearly',  priority: '0.3' },
  { loc: `${SITE}/terminos`,                               lastmod: today, changefreq: 'yearly',  priority: '0.3' },
];

async function fetchPostUrls() {
  if (!url || !anonKey) {
    console.warn('[sitemap] Supabase env not set — emitting static URLs only.');
    return [];
  }
  try {
    const client = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data, error } = await client
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published');
    if (error) {
      console.warn('[sitemap] Supabase query failed:', error.message);
      return [];
    }
    return (data ?? []).map((row) => ({
      loc: `${SITE}/blog/${row.slug}`,
      lastmod: row.updated_at ? row.updated_at.slice(0, 10) : today,
      changefreq: 'monthly',
      priority: '0.6',
    }));
  } catch (err) {
    console.warn('[sitemap] Supabase unreachable:', err?.message ?? err);
    return [];
  }
}

function toXml(entries) {
  const body = entries
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

const postUrls = await fetchPostUrls();
const all = [...staticUrls, ...postUrls];
writeFileSync(OUTPUT, toXml(all), 'utf8');
console.log(`[sitemap] wrote ${all.length} URLs to public/sitemap.xml`);
