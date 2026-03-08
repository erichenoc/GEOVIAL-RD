-- Migration: 20260308000008_activity_log.sql
-- Description: Activity log for comprehensive audit trail
-- Date: 2026-03-08

-- ============================================================================
-- TABLE: activity_log (append-only audit trail)
-- ============================================================================

CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT valid_action CHECK (
    action IN (
      'report.created', 'report.updated', 'report.status_changed', 'report.deleted',
      'report.photo_added', 'report.comment_added', 'report.brigade_assigned',
      'user.invited', 'user.joined', 'user.role_changed', 'user.deactivated',
      'brigade.created', 'brigade.updated', 'brigade.member_added', 'brigade.member_removed',
      'zone.created', 'zone.updated', 'zone.deleted',
      'sector.created', 'sector.updated', 'sector.deleted',
      'org.settings_updated', 'org.logo_changed',
      'auth.login', 'auth.logout', 'auth.password_reset'
    )
  ),
  CONSTRAINT valid_entity_type CHECK (
    entity_type IN ('report', 'user', 'brigade', 'zone', 'sector', 'organization', 'auth')
  )
);

CREATE INDEX idx_activity_log_org ON public.activity_log (organization_id, created_at DESC);
CREATE INDEX idx_activity_log_user ON public.activity_log (user_id, created_at DESC);
CREATE INDEX idx_activity_log_entity ON public.activity_log (entity_type, entity_id);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Admins and gerentes can view activity log for their org
CREATE POLICY "activity_log_select"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND public.get_user_role() IN ('admin', 'gerente')
    )
  );

-- Insert allowed for all authenticated users in their org (used by triggers)
CREATE POLICY "activity_log_insert"
  ON public.activity_log FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

-- NO UPDATE POLICY: activity_log is immutable
-- NO DELETE POLICY: activity_log is immutable

-- ============================================================================
-- HELPER: Log activity from server actions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_activity(
  p_action text,
  p_entity_type text,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.activity_log (organization_id, user_id, action, entity_type, entity_id, metadata)
  VALUES (
    public.get_user_org_id(),
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_metadata
  );
END;
$$;
