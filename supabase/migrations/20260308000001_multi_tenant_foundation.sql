-- Migration: 20260308000001_multi_tenant_foundation.sql
-- Description: Core multi-tenant tables, RLS policies, indexes, and seed data for GEOVIAL-RD
-- Architecture: Shared DB + Row Level Security (single schema, organization_id on every tenant table)
-- Date: 2026-03-08

-- ============================================================================
-- HELPER FUNCTIONS (extract tenant context from JWT)
-- ============================================================================

-- Extract the current user's organization_id from JWT app_metadata
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
$$;

-- Extract the current user's role from JWT app_metadata
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT auth.jwt() -> 'app_metadata' ->> 'role'
$$;

-- Check if current user is super_admin (SaaS owner)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'super_admin'
$$;

-- Check if current user is org admin or higher
CREATE OR REPLACE FUNCTION public.is_org_admin_or_above()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('admin', 'gerente', 'super_admin')
$$;

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE public.user_role AS ENUM (
  'inspector',
  'supervisor',
  'gerente',
  'admin',
  'super_admin'
);

CREATE TYPE public.report_status AS ENUM (
  'draft',
  'submitted',
  'in_review',
  'approved',
  'in_progress',
  'completed',
  'rejected',
  'cancelled'
);

CREATE TYPE public.photo_type AS ENUM (
  'before',
  'during',
  'after'
);

CREATE TYPE public.damage_severity_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE public.invitation_status AS ENUM (
  'pending',
  'accepted',
  'expired',
  'revoked'
);

-- ============================================================================
-- TABLE 1: organizations (ayuntamientos / municipalities)
-- ============================================================================

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  rnc text,                          -- Registro Nacional del Contribuyente
  province text NOT NULL,
  municipality text NOT NULL,
  address text,
  phone text,
  email text,
  logo_url text,
  is_active boolean NOT NULL DEFAULT true,
  max_users integer NOT NULL DEFAULT 50,
  subscription_tier text NOT NULL DEFAULT 'basic',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT slug_format CHECK (slug ~* '^[a-z0-9-]+$'),
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[^@]+@[^@]+\.[^@]+$')
);

CREATE INDEX idx_organizations_slug ON public.organizations (slug);
CREATE INDEX idx_organizations_active ON public.organizations (is_active) WHERE deleted_at IS NULL;

-- ============================================================================
-- TABLE 2: user_profiles (extends auth.users with app-specific data)
-- ============================================================================

CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  role public.user_role NOT NULL DEFAULT 'inspector',
  first_name text NOT NULL,
  last_name text NOT NULL,
  cedula text,                       -- Dominican national ID
  phone text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_profiles_org ON public.user_profiles (organization_id);
CREATE INDEX idx_user_profiles_org_role ON public.user_profiles (organization_id, role);
CREATE INDEX idx_user_profiles_org_active ON public.user_profiles (organization_id, is_active)
  WHERE deleted_at IS NULL;

-- ============================================================================
-- TABLE 3: zones (geographic zones within a municipality)
-- ============================================================================

CREATE TABLE public.zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  description text,
  color_hex text DEFAULT '#3B82F6',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_zone_name_per_org UNIQUE (organization_id, name)
);

CREATE INDEX idx_zones_org ON public.zones (organization_id);

-- ============================================================================
-- TABLE 4: sectors (subdivisions within zones)
-- ============================================================================

CREATE TABLE public.sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  zone_id uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_sector_name_per_zone UNIQUE (zone_id, name)
);

CREATE INDEX idx_sectors_org ON public.sectors (organization_id);
CREATE INDEX idx_sectors_zone ON public.sectors (zone_id);

-- ============================================================================
-- TABLE 5: brigades (work crews assigned to repair tasks)
-- ============================================================================

CREATE TABLE public.brigades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_brigade_name_per_org UNIQUE (organization_id, name)
);

CREATE INDEX idx_brigades_org ON public.brigades (organization_id);

-- ============================================================================
-- TABLE 6: brigade_members (users assigned to brigades)
-- ============================================================================

CREATE TABLE public.brigade_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  brigade_id uuid NOT NULL REFERENCES public.brigades(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  is_leader boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_user_per_brigade UNIQUE (brigade_id, user_id)
);

CREATE INDEX idx_brigade_members_org ON public.brigade_members (organization_id);
CREATE INDEX idx_brigade_members_brigade ON public.brigade_members (brigade_id);
CREATE INDEX idx_brigade_members_user ON public.brigade_members (user_id);

-- ============================================================================
-- TABLE 7: damage_types (GLOBAL catalog -- no organization_id)
-- ============================================================================

CREATE TABLE public.damage_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  name_en text,
  description text,
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE 8: damage_severities (GLOBAL catalog -- no organization_id)
-- ============================================================================

CREATE TABLE public.damage_severities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level public.damage_severity_level UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  color_hex text NOT NULL,
  response_days integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE 9: reports (the core entity -- road damage reports)
-- ============================================================================

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  report_number text NOT NULL,
  title text NOT NULL,
  description text,

  -- Location
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text,
  zone_id uuid REFERENCES public.zones(id),
  sector_id uuid REFERENCES public.sectors(id),

  -- Classification
  damage_type_id uuid NOT NULL REFERENCES public.damage_types(id),
  severity_id uuid REFERENCES public.damage_severities(id),

  -- Status
  status public.report_status NOT NULL DEFAULT 'draft',

  -- Assignment
  assigned_brigade_id uuid REFERENCES public.brigades(id),

  -- People
  reported_by uuid NOT NULL REFERENCES public.user_profiles(id),
  assigned_to uuid REFERENCES public.user_profiles(id),

  -- Dates
  reported_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  due_date date,

  -- Metadata
  estimated_cost decimal(12, 2),
  actual_cost decimal(12, 2),
  road_name text,
  road_type text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_report_number_per_org UNIQUE (organization_id, report_number),
  CONSTRAINT valid_coordinates CHECK (
    latitude BETWEEN -90 AND 90
    AND longitude BETWEEN -180 AND 180
  ),
  CONSTRAINT valid_costs CHECK (
    (estimated_cost IS NULL OR estimated_cost >= 0)
    AND (actual_cost IS NULL OR actual_cost >= 0)
  )
);

CREATE INDEX idx_reports_org ON public.reports (organization_id);
CREATE INDEX idx_reports_org_status ON public.reports (organization_id, status);
CREATE INDEX idx_reports_org_damage ON public.reports (organization_id, damage_type_id);
CREATE INDEX idx_reports_org_date ON public.reports (organization_id, reported_at DESC);
CREATE INDEX idx_reports_org_zone ON public.reports (organization_id, zone_id);
CREATE INDEX idx_reports_reported_by ON public.reports (reported_by);
CREATE INDEX idx_reports_assigned_to ON public.reports (assigned_to);
CREATE INDEX idx_reports_brigade ON public.reports (assigned_brigade_id);
CREATE INDEX idx_reports_location ON public.reports (latitude, longitude);

-- ============================================================================
-- TABLE 10: report_photos
-- ============================================================================

CREATE TABLE public.report_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  photo_type public.photo_type NOT NULL DEFAULT 'before',
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  mime_type text,
  caption text,
  taken_at timestamptz,
  latitude double precision,
  longitude double precision,
  uploaded_by uuid NOT NULL REFERENCES public.user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_report_photos_org ON public.report_photos (organization_id);
CREATE INDEX idx_report_photos_report ON public.report_photos (report_id);

-- ============================================================================
-- TABLE 11: report_comments
-- ============================================================================

CREATE TABLE public.report_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id),
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_report_comments_org ON public.report_comments (organization_id);
CREATE INDEX idx_report_comments_report ON public.report_comments (report_id);

-- ============================================================================
-- TABLE 12: status_history (immutable audit trail)
-- ============================================================================

CREATE TABLE public.status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  old_status public.report_status,
  new_status public.report_status NOT NULL,
  changed_by uuid NOT NULL REFERENCES public.user_profiles(id),
  reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_history_org ON public.status_history (organization_id);
CREATE INDEX idx_status_history_report ON public.status_history (report_id);
CREATE INDEX idx_status_history_date ON public.status_history (created_at DESC);

-- ============================================================================
-- TABLE 13: invitations (how org admins invite new users)
-- ============================================================================

CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  email text NOT NULL,
  role public.user_role NOT NULL DEFAULT 'inspector',
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status public.invitation_status NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL REFERENCES public.user_profiles(id),
  accepted_by uuid REFERENCES public.user_profiles(id),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT valid_invite_email CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

CREATE INDEX idx_invitations_org ON public.invitations (organization_id);
CREATE INDEX idx_invitations_token ON public.invitations (token) WHERE status = 'pending';
CREATE INDEX idx_invitations_email ON public.invitations (email, organization_id);

-- ============================================================================
-- UPDATED_AT TRIGGER (reusable)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'organizations', 'user_profiles', 'zones', 'sectors',
      'brigades', 'reports', 'report_comments'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()',
      t
    );
  END LOOP;
END;
$$;

-- ============================================================================
-- AUTO-INCREMENT REPORT NUMBER per organization
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_report_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  next_num integer;
  org_slug text;
BEGIN
  -- Get the org slug for prefix
  SELECT slug INTO org_slug
  FROM public.organizations
  WHERE id = NEW.organization_id;

  -- Count existing reports for this org + 1
  SELECT count(*) + 1 INTO next_num
  FROM public.reports
  WHERE organization_id = NEW.organization_id;

  NEW.report_number := upper(org_slug) || '-' || lpad(next_num::text, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_report_number
  BEFORE INSERT ON public.reports
  FOR EACH ROW
  WHEN (NEW.report_number IS NULL OR NEW.report_number = '')
  EXECUTE FUNCTION public.generate_report_number();

-- ============================================================================
-- AUTO-INSERT STATUS HISTORY on report status change
-- ============================================================================

CREATE OR REPLACE FUNCTION public.track_report_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.status_history (organization_id, report_id, old_status, new_status, changed_by)
    VALUES (NEW.organization_id, NEW.id, NULL, NEW.status, NEW.reported_by);
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.status_history (organization_id, report_id, old_status, new_status, changed_by)
    VALUES (NEW.organization_id, NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER track_status_change
  AFTER INSERT OR UPDATE OF status ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.track_report_status_change();
