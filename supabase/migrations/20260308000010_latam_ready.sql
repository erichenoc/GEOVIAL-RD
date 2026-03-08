-- Migration: 20260308000010_latam_ready.sql
-- Description: Prepare for LATAM expansion - country support in organizations and territories
-- Date: 2026-03-08

-- ============================================================================
-- Add country_code to organizations (ISO 3166-1 alpha-2)
-- ============================================================================

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'DO';

COMMENT ON COLUMN public.organizations.country_code IS 'ISO 3166-1 alpha-2 country code. DO=Dominican Republic';

CREATE INDEX IF NOT EXISTS idx_organizations_country ON public.organizations(country_code);

-- ============================================================================
-- Add country_code to territorial tables for multi-country support
-- ============================================================================

ALTER TABLE public.territorial_regions
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'DO';

ALTER TABLE public.territorial_provinces
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'DO';

ALTER TABLE public.territorial_municipalities
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'DO';

CREATE INDEX IF NOT EXISTS idx_terr_regions_country ON public.territorial_regions(country_code);
CREATE INDEX IF NOT EXISTS idx_terr_provinces_country ON public.territorial_provinces(country_code);
CREATE INDEX IF NOT EXISTS idx_terr_municipalities_country ON public.territorial_municipalities(country_code);

-- ============================================================================
-- Countries reference table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.countries (
  code text PRIMARY KEY,  -- ISO 3166-1 alpha-2
  name text NOT NULL,
  name_en text NOT NULL,
  phone_code text,
  currency_code text DEFAULT 'USD',
  is_active boolean NOT NULL DEFAULT false,  -- Only active countries are available
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "countries_select" ON public.countries FOR SELECT TO authenticated USING (true);
CREATE POLICY "countries_admin" ON public.countries FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- Seed LATAM countries (inactive until territorial data is loaded)
INSERT INTO public.countries (code, name, name_en, phone_code, currency_code, is_active) VALUES
  ('DO', 'Republica Dominicana',    'Dominican Republic',  '+1-809', 'DOP', true),
  ('PR', 'Puerto Rico',             'Puerto Rico',         '+1-787', 'USD', false),
  ('CO', 'Colombia',                'Colombia',            '+57',    'COP', false),
  ('MX', 'Mexico',                  'Mexico',              '+52',    'MXN', false),
  ('PE', 'Peru',                    'Peru',                '+51',    'PEN', false),
  ('CL', 'Chile',                   'Chile',               '+56',    'CLP', false),
  ('AR', 'Argentina',               'Argentina',           '+54',    'ARS', false),
  ('EC', 'Ecuador',                 'Ecuador',             '+593',   'USD', false),
  ('PA', 'Panama',                  'Panama',              '+507',   'USD', false),
  ('CR', 'Costa Rica',              'Costa Rica',          '+506',   'CRC', false),
  ('GT', 'Guatemala',               'Guatemala',           '+502',   'GTQ', false),
  ('HN', 'Honduras',                'Honduras',            '+504',   'HNL', false),
  ('SV', 'El Salvador',             'El Salvador',         '+503',   'USD', false),
  ('NI', 'Nicaragua',               'Nicaragua',           '+505',   'NIO', false),
  ('BO', 'Bolivia',                 'Bolivia',             '+591',   'BOB', false),
  ('PY', 'Paraguay',                'Paraguay',            '+595',   'PYG', false),
  ('UY', 'Uruguay',                 'Uruguay',             '+598',   'UYU', false),
  ('VE', 'Venezuela',               'Venezuela',           '+58',    'VES', false),
  ('CU', 'Cuba',                    'Cuba',                '+53',    'CUP', false),
  ('HT', 'Haiti',                   'Haiti',               '+509',   'HTG', false)
ON CONFLICT (code) DO NOTHING;
