-- ============================================================================
-- Homie CMS — Leads de proyección (formulario Hero / Contact)
-- Ejecutar UNA VEZ en Supabase SQL Editor.
-- Idempotente: safe para reejecutar.
--
-- Tabla pública homie_leads:
--   • INSERT abierto al rol anon (cualquier visitante puede enviarnos su lead)
--   • SELECT / UPDATE / DELETE sólo para usuarios autenticados (CMS admin)
-- ============================================================================

-- ── 1. Tabla ───────────────────────────────────────────────────────────────
create table if not exists public.homie_leads (
  id               uuid         primary key default gen_random_uuid(),
  created_at       timestamptz  not null default now(),
  updated_at       timestamptz  not null default now(),

  -- Estado del lead en el pipeline de ventas
  status           text         not null default 'new'
                                check (status in ('new','contacted','qualified','converted','archived')),

  -- Datos de contacto
  name             text         not null,
  phone            text         not null,
  email            text         not null,

  -- Ubicación de la propiedad
  city             text         not null,
  district         text         not null,
  address          text         not null,

  -- Detalles de la propiedad (strings porque son rangos, ej. "Menos de 50")
  sqm              text         not null,
  bedrooms         text         not null,
  bathrooms        text         not null,
  guests           text         not null,

  -- Consent + metadatos
  terms_accepted   boolean      not null default false,
  source           text         not null default 'hero_modal',
  lang             text         not null default 'es' check (lang in ('es','en')),
  user_agent       text,
  referrer         text,

  -- Seguimiento interno (sólo CMS)
  notes            text
);

-- Columnas añadidas en ejecuciones posteriores (safe add)
alter table public.homie_leads add column if not exists user_agent text;
alter table public.homie_leads add column if not exists referrer   text;
alter table public.homie_leads add column if not exists notes      text;

-- ── 2. Índices ─────────────────────────────────────────────────────────────
create index if not exists homie_leads_created_at_idx
  on public.homie_leads (created_at desc);

create index if not exists homie_leads_status_idx
  on public.homie_leads (status, created_at desc);

create index if not exists homie_leads_email_idx
  on public.homie_leads (email);

-- ── 3. Trigger updated_at ─────────────────────────────────────────────────
create or replace function public.tg_homie_leads_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists homie_leads_set_updated_at on public.homie_leads;
create trigger homie_leads_set_updated_at
  before update on public.homie_leads
  for each row execute function public.tg_homie_leads_set_updated_at();

-- ── 4. RLS ─────────────────────────────────────────────────────────────────
alter table public.homie_leads enable row level security;

drop policy if exists "homie_leads_public_insert" on public.homie_leads;
drop policy if exists "homie_leads_auth_select"   on public.homie_leads;
drop policy if exists "homie_leads_auth_update"   on public.homie_leads;
drop policy if exists "homie_leads_auth_delete"   on public.homie_leads;

-- Visitantes anónimos (formulario público) pueden INSERTAR, pero nunca leer.
create policy "homie_leads_public_insert"
  on public.homie_leads
  for insert
  to anon, authenticated
  with check (true);

-- Sólo usuarios autenticados (CMS) pueden leer / modificar / borrar.
create policy "homie_leads_auth_select"
  on public.homie_leads
  for select
  to authenticated
  using (true);

create policy "homie_leads_auth_update"
  on public.homie_leads
  for update
  to authenticated
  using (true) with check (true);

create policy "homie_leads_auth_delete"
  on public.homie_leads
  for delete
  to authenticated
  using (true);

-- ── 5. Verificación ────────────────────────────────────────────────────────
-- Debería devolver una fila con el conteo actual (0 al inicio).
select count(*) as total_leads from public.homie_leads;

-- Lista de políticas activas sobre la tabla (debería mostrar las 4 de arriba).
select policyname, cmd, roles
  from pg_policies
 where schemaname = 'public' and tablename = 'homie_leads'
 order by policyname;
