-- Migration: 20260308000004_auth_helpers.sql
-- Description: Server-side functions for org management and user onboarding
-- Date: 2026-03-08

-- ============================================================================
-- FUNCTION: Create a new organization + its first admin user
-- Called by super_admin or during onboarding flow via Edge Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_organization_with_admin(
  p_org_name text,
  p_org_slug text,
  p_province text,
  p_municipality text,
  p_municipality_code text,  -- territorial code e.g. '32-01' for Santo Domingo Este
  p_admin_user_id uuid,
  p_admin_first_name text,
  p_admin_last_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- Create organization linked to territorial municipality
  INSERT INTO public.organizations (name, slug, province, municipality, municipality_code)
  VALUES (p_org_name, p_org_slug, p_province, p_municipality, p_municipality_code)
  RETURNING id INTO new_org_id;

  -- Create admin profile
  INSERT INTO public.user_profiles (id, organization_id, role, first_name, last_name)
  VALUES (p_admin_user_id, new_org_id, 'admin', p_admin_first_name, p_admin_last_name);

  -- Set app_metadata on the auth user (JWT will include org_id and role)
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_build_object(
    'organization_id', new_org_id,
    'role', 'admin'
  )
  WHERE id = p_admin_user_id;

  -- Auto-populate zones and sectors from territorial data
  IF p_municipality_code IS NOT NULL THEN
    PERFORM public.populate_org_territory(new_org_id, p_municipality_code);
  END IF;

  RETURN new_org_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Invite a user to an organization
-- Called by org admin/gerente
-- ============================================================================

CREATE OR REPLACE FUNCTION public.invite_user_to_org(
  p_email text,
  p_role public.user_role DEFAULT 'inspector'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  caller_org_id uuid;
  caller_role text;
  inv_id uuid;
  existing_count integer;
BEGIN
  -- Get caller context
  caller_org_id := public.get_user_org_id();
  caller_role := public.get_user_role();

  -- Validate caller has permission
  IF caller_role NOT IN ('admin', 'gerente', 'super_admin') THEN
    RAISE EXCEPTION 'Only admin or gerente can invite users';
  END IF;

  -- Prevent inviting to a role higher than or equal to the caller
  IF p_role::text = 'super_admin' AND caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Cannot invite a super_admin';
  END IF;
  IF p_role::text = 'admin' AND caller_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Only admin can invite another admin';
  END IF;

  -- Check for existing pending invitation
  SELECT count(*) INTO existing_count
  FROM public.invitations
  WHERE email = p_email
    AND organization_id = caller_org_id
    AND status = 'pending'
    AND expires_at > now();

  IF existing_count > 0 THEN
    RAISE EXCEPTION 'A pending invitation already exists for this email';
  END IF;

  -- Check org user limit
  DECLARE
    current_users integer;
    max_allowed integer;
  BEGIN
    SELECT count(*) INTO current_users
    FROM public.user_profiles
    WHERE organization_id = caller_org_id AND deleted_at IS NULL;

    SELECT max_users INTO max_allowed
    FROM public.organizations
    WHERE id = caller_org_id;

    IF current_users >= max_allowed THEN
      RAISE EXCEPTION 'Organization has reached the maximum number of users (%)' , max_allowed;
    END IF;
  END;

  -- Create invitation
  INSERT INTO public.invitations (organization_id, email, role, invited_by)
  VALUES (caller_org_id, p_email, p_role, auth.uid())
  RETURNING id INTO inv_id;

  RETURN inv_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Accept invitation (called during signup callback)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.accept_invitation(
  p_token text,
  p_user_id uuid,
  p_first_name text,
  p_last_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  inv record;
BEGIN
  -- Find valid invitation
  SELECT * INTO inv
  FROM public.invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now();

  IF inv IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- Create user profile
  INSERT INTO public.user_profiles (id, organization_id, role, first_name, last_name)
  VALUES (p_user_id, inv.organization_id, inv.role, p_first_name, p_last_name);

  -- Set app_metadata
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_build_object(
    'organization_id', inv.organization_id,
    'role', inv.role::text
  )
  WHERE id = p_user_id;

  -- Mark invitation accepted
  UPDATE public.invitations
  SET status = 'accepted',
      accepted_by = p_user_id
  WHERE id = inv.id;

  RETURN jsonb_build_object(
    'organization_id', inv.organization_id,
    'role', inv.role::text,
    'organization_name', (SELECT name FROM public.organizations WHERE id = inv.organization_id)
  );
END;
$$;

-- ============================================================================
-- FUNCTION: Update user role (admin operation)
-- Also updates JWT claims so next token refresh picks up new role
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_user_role(
  p_user_id uuid,
  p_new_role public.user_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  caller_org_id uuid;
  target_org_id uuid;
  caller_role text;
BEGIN
  caller_org_id := public.get_user_org_id();
  caller_role := public.get_user_role();

  -- Get target user's org
  SELECT organization_id INTO target_org_id
  FROM public.user_profiles
  WHERE id = p_user_id;

  -- Validate same org (unless super_admin)
  IF caller_role != 'super_admin' AND target_org_id != caller_org_id THEN
    RAISE EXCEPTION 'Cannot modify users from another organization';
  END IF;

  -- Validate permission
  IF caller_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Only admin can change user roles';
  END IF;

  IF p_new_role::text = 'super_admin' AND caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super_admin can promote to super_admin';
  END IF;

  -- Update profile
  UPDATE public.user_profiles
  SET role = p_new_role
  WHERE id = p_user_id;

  -- Update auth metadata (reflected in next JWT refresh)
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', p_new_role::text)
  WHERE id = p_user_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Dashboard stats for the current org
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_org_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  org_id uuid;
  result jsonb;
BEGIN
  org_id := public.get_user_org_id();

  SELECT jsonb_build_object(
    'total_reports', (SELECT count(*) FROM public.reports WHERE organization_id = org_id),
    'pending_reports', (SELECT count(*) FROM public.reports WHERE organization_id = org_id AND status IN ('draft', 'submitted', 'in_review')),
    'in_progress_reports', (SELECT count(*) FROM public.reports WHERE organization_id = org_id AND status IN ('approved', 'in_progress')),
    'completed_reports', (SELECT count(*) FROM public.reports WHERE organization_id = org_id AND status = 'completed'),
    'total_users', (SELECT count(*) FROM public.user_profiles WHERE organization_id = org_id AND deleted_at IS NULL),
    'total_brigades', (SELECT count(*) FROM public.brigades WHERE organization_id = org_id AND is_active = true),
    'total_zones', (SELECT count(*) FROM public.zones WHERE organization_id = org_id AND is_active = true),
    'reports_this_month', (SELECT count(*) FROM public.reports WHERE organization_id = org_id AND reported_at >= date_trunc('month', now())),
    'by_severity', (
      SELECT coalesce(jsonb_object_agg(ds.level, cnt), '{}')
      FROM (
        SELECT r.severity_id, count(*) as cnt
        FROM public.reports r
        WHERE r.organization_id = org_id AND r.status NOT IN ('cancelled', 'rejected')
        GROUP BY r.severity_id
      ) sub
      JOIN public.damage_severities ds ON ds.id = sub.severity_id
    ),
    'by_status', (
      SELECT coalesce(jsonb_object_agg(status, cnt), '{}')
      FROM (
        SELECT status, count(*) as cnt
        FROM public.reports
        WHERE organization_id = org_id
        GROUP BY status
      ) sub
    )
  ) INTO result;

  RETURN result;
END;
$$;
