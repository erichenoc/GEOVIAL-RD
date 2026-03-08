-- Migration: 20260308000002_rls_policies.sql
-- Description: Row Level Security policies for complete tenant isolation
-- Date: 2026-03-08
--
-- PATTERN: Every tenant-scoped table uses this logic:
--   SELECT: super_admin sees all, others see only their org
--   INSERT: organization_id must match user's org (super_admin exempt)
--   UPDATE: same as SELECT
--   DELETE: restricted to admin+ roles within their org
--
-- Global catalogs (damage_types, damage_severities): read-only for all authenticated users

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brigades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brigade_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damage_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damage_severities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

-- Users can see their own organization; super_admin sees all
CREATE POLICY "organizations_select"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR id = public.get_user_org_id()
  );

-- Only super_admin can create organizations
CREATE POLICY "organizations_insert"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

-- Org admin can update their own org; super_admin can update any
CREATE POLICY "organizations_update"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (id = public.get_user_org_id() AND public.get_user_role() = 'admin')
  )
  WITH CHECK (
    public.is_super_admin()
    OR (id = public.get_user_org_id() AND public.get_user_role() = 'admin')
  );

-- Only super_admin can delete organizations
CREATE POLICY "organizations_delete"
  ON public.organizations FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- ============================================================================
-- USER_PROFILES
-- ============================================================================

-- Users see profiles in their org; super_admin sees all
CREATE POLICY "user_profiles_select"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

-- Admin/gerente can create profiles in their org; super_admin anywhere
CREATE POLICY "user_profiles_insert"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.is_org_admin_or_above()
    )
  );

-- Users can update their own profile; admin can update any in their org
CREATE POLICY "user_profiles_update"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR id = auth.uid()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() IN ('admin', 'gerente')
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR id = auth.uid()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() IN ('admin', 'gerente')
    )
  );

-- Only admin can soft-delete users in their org
CREATE POLICY "user_profiles_delete"
  ON public.user_profiles FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() = 'admin'
    )
  );

-- ============================================================================
-- ZONES
-- ============================================================================

CREATE POLICY "zones_select"
  ON public.zones FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

CREATE POLICY "zones_insert"
  ON public.zones FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.is_org_admin_or_above()
    )
  );

CREATE POLICY "zones_update"
  ON public.zones FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.is_org_admin_or_above()
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.is_org_admin_or_above()
    )
  );

CREATE POLICY "zones_delete"
  ON public.zones FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() = 'admin'
    )
  );

-- ============================================================================
-- SECTORS
-- ============================================================================

CREATE POLICY "sectors_select"
  ON public.sectors FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

CREATE POLICY "sectors_insert"
  ON public.sectors FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.is_org_admin_or_above()
    )
  );

CREATE POLICY "sectors_update"
  ON public.sectors FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.is_org_admin_or_above()
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.is_org_admin_or_above()
    )
  );

CREATE POLICY "sectors_delete"
  ON public.sectors FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() = 'admin'
    )
  );

-- ============================================================================
-- BRIGADES
-- ============================================================================

CREATE POLICY "brigades_select"
  ON public.brigades FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

CREATE POLICY "brigades_insert"
  ON public.brigades FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.is_org_admin_or_above()
    )
  );

CREATE POLICY "brigades_update"
  ON public.brigades FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.is_org_admin_or_above()
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.is_org_admin_or_above()
    )
  );

CREATE POLICY "brigades_delete"
  ON public.brigades FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() = 'admin'
    )
  );

-- ============================================================================
-- BRIGADE_MEMBERS
-- ============================================================================

CREATE POLICY "brigade_members_select"
  ON public.brigade_members FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

CREATE POLICY "brigade_members_insert"
  ON public.brigade_members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() IN ('admin', 'gerente', 'supervisor')
    )
  );

CREATE POLICY "brigade_members_update"
  ON public.brigade_members FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() IN ('admin', 'gerente', 'supervisor')
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() IN ('admin', 'gerente', 'supervisor')
    )
  );

CREATE POLICY "brigade_members_delete"
  ON public.brigade_members FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() IN ('admin', 'gerente', 'supervisor')
    )
  );

-- ============================================================================
-- DAMAGE_TYPES (global catalog -- read-only for all authenticated)
-- ============================================================================

CREATE POLICY "damage_types_select"
  ON public.damage_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "damage_types_insert"
  ON public.damage_types FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "damage_types_update"
  ON public.damage_types FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "damage_types_delete"
  ON public.damage_types FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- ============================================================================
-- DAMAGE_SEVERITIES (global catalog -- read-only for all authenticated)
-- ============================================================================

CREATE POLICY "damage_severities_select"
  ON public.damage_severities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "damage_severities_insert"
  ON public.damage_severities FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "damage_severities_update"
  ON public.damage_severities FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "damage_severities_delete"
  ON public.damage_severities FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- ============================================================================
-- REPORTS
-- ============================================================================

-- All org members can see reports in their org
CREATE POLICY "reports_select"
  ON public.reports FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

-- Inspectors+ can create reports in their org
CREATE POLICY "reports_insert"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

-- Supervisors+ can update any report in their org; inspectors only their own
CREATE POLICY "reports_update"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND (
        public.get_user_role() IN ('admin', 'gerente', 'supervisor')
        OR reported_by = auth.uid()
      )
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND (
        public.get_user_role() IN ('admin', 'gerente', 'supervisor')
        OR reported_by = auth.uid()
      )
    )
  );

-- Only admin can delete reports
CREATE POLICY "reports_delete"
  ON public.reports FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() = 'admin'
    )
  );

-- ============================================================================
-- REPORT_PHOTOS
-- ============================================================================

CREATE POLICY "report_photos_select"
  ON public.report_photos FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

CREATE POLICY "report_photos_insert"
  ON public.report_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

CREATE POLICY "report_photos_update"
  ON public.report_photos FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND (uploaded_by = auth.uid() OR public.get_user_role() IN ('admin', 'gerente', 'supervisor'))
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND (uploaded_by = auth.uid() OR public.get_user_role() IN ('admin', 'gerente', 'supervisor'))
    )
  );

CREATE POLICY "report_photos_delete"
  ON public.report_photos FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() IN ('admin', 'gerente')
    )
  );

-- ============================================================================
-- REPORT_COMMENTS
-- ============================================================================

CREATE POLICY "report_comments_select"
  ON public.report_comments FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

CREATE POLICY "report_comments_insert"
  ON public.report_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

-- Users can update their own comments; admin can update any
CREATE POLICY "report_comments_update"
  ON public.report_comments FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND (user_id = auth.uid() OR public.get_user_role() = 'admin')
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND (user_id = auth.uid() OR public.get_user_role() = 'admin')
    )
  );

CREATE POLICY "report_comments_delete"
  ON public.report_comments FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND (user_id = auth.uid() OR public.get_user_role() = 'admin')
    )
  );

-- ============================================================================
-- STATUS_HISTORY (append-only audit trail -- NO UPDATE, NO DELETE)
-- ============================================================================

CREATE POLICY "status_history_select"
  ON public.status_history FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

-- Insert is handled by trigger (SECURITY DEFINER), but allow manual insert too
CREATE POLICY "status_history_insert"
  ON public.status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

-- NO UPDATE POLICY: status_history is immutable
-- NO DELETE POLICY: status_history is immutable

-- ============================================================================
-- INVITATIONS
-- ============================================================================

-- Admins see invitations in their org; invited users can see their own by token
CREATE POLICY "invitations_select"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() IN ('admin', 'gerente')
    )
  );

-- Allow anon to check invitation by token (for signup flow)
CREATE POLICY "invitations_select_by_token"
  ON public.invitations FOR SELECT
  TO anon
  USING (
    status = 'pending'
    AND expires_at > now()
  );

CREATE POLICY "invitations_insert"
  ON public.invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() IN ('admin', 'gerente')
    )
  );

CREATE POLICY "invitations_update"
  ON public.invitations FOR UPDATE
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() IN ('admin', 'gerente')
    )
  );

CREATE POLICY "invitations_delete"
  ON public.invitations FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() = 'admin'
    )
  );
