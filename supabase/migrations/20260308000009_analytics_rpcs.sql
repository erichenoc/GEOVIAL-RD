-- Migration: 20260308000009_analytics_rpcs.sql
-- Description: Analytics RPC functions for dashboards and reporting
-- Date: 2026-03-08

-- ============================================================================
-- FUNCTION: Reports grouped by period (daily, weekly, monthly)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_reports_by_period(
  p_interval text DEFAULT 'month',  -- 'day', 'week', 'month'
  p_months integer DEFAULT 6
)
RETURNS TABLE(period text, total bigint, completed bigint, pending bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(date_trunc(p_interval, r.reported_at), 'YYYY-MM-DD') as period,
    count(*) as total,
    count(*) FILTER (WHERE r.status = 'completed') as completed,
    count(*) FILTER (WHERE r.status IN ('draft', 'submitted', 'in_review', 'approved', 'in_progress')) as pending
  FROM public.reports r
  WHERE r.organization_id = public.get_user_org_id()
    AND r.reported_at >= now() - (p_months || ' months')::interval
  GROUP BY date_trunc(p_interval, r.reported_at)
  ORDER BY period;
END;
$$;

-- ============================================================================
-- FUNCTION: Average response time (report to completion)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_avg_response_time()
RETURNS TABLE(
  avg_hours_to_assign numeric,
  avg_hours_to_complete numeric,
  avg_hours_total numeric,
  reports_measured bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH times AS (
    SELECT
      r.id,
      r.reported_at,
      r.resolved_at,
      (SELECT min(sh.created_at) FROM public.status_history sh
       WHERE sh.report_id = r.id AND sh.new_status = 'in_progress') as started_at
    FROM public.reports r
    WHERE r.organization_id = public.get_user_org_id()
      AND r.status = 'completed'
      AND r.resolved_at IS NOT NULL
  )
  SELECT
    round(avg(EXTRACT(EPOCH FROM (started_at - reported_at)) / 3600)::numeric, 1) as avg_hours_to_assign,
    round(avg(EXTRACT(EPOCH FROM (resolved_at - coalesce(started_at, reported_at))) / 3600)::numeric, 1) as avg_hours_to_complete,
    round(avg(EXTRACT(EPOCH FROM (resolved_at - reported_at)) / 3600)::numeric, 1) as avg_hours_total,
    count(*) as reports_measured
  FROM times;
END;
$$;

-- ============================================================================
-- FUNCTION: Completion rate by period
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_completion_rate()
RETURNS TABLE(
  total_reports bigint,
  completed bigint,
  rejected bigint,
  in_progress bigint,
  pending bigint,
  completion_rate numeric,
  this_month_total bigint,
  this_month_completed bigint,
  last_month_total bigint,
  last_month_completed bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  org_id uuid;
BEGIN
  org_id := public.get_user_org_id();

  RETURN QUERY
  SELECT
    (SELECT count(*) FROM public.reports WHERE organization_id = org_id) as total_reports,
    (SELECT count(*) FROM public.reports WHERE organization_id = org_id AND status = 'completed') as completed,
    (SELECT count(*) FROM public.reports WHERE organization_id = org_id AND status = 'rejected') as rejected,
    (SELECT count(*) FROM public.reports WHERE organization_id = org_id AND status IN ('approved', 'in_progress')) as in_progress,
    (SELECT count(*) FROM public.reports WHERE organization_id = org_id AND status IN ('draft', 'submitted', 'in_review')) as pending,
    round(
      (SELECT count(*)::numeric FROM public.reports WHERE organization_id = org_id AND status = 'completed')
      / nullif((SELECT count(*)::numeric FROM public.reports WHERE organization_id = org_id), 0)
      * 100, 1
    ) as completion_rate,
    (SELECT count(*) FROM public.reports WHERE organization_id = org_id AND reported_at >= date_trunc('month', now())) as this_month_total,
    (SELECT count(*) FROM public.reports WHERE organization_id = org_id AND status = 'completed' AND reported_at >= date_trunc('month', now())) as this_month_completed,
    (SELECT count(*) FROM public.reports WHERE organization_id = org_id AND reported_at >= date_trunc('month', now() - interval '1 month') AND reported_at < date_trunc('month', now())) as last_month_total,
    (SELECT count(*) FROM public.reports WHERE organization_id = org_id AND status = 'completed' AND reported_at >= date_trunc('month', now() - interval '1 month') AND reported_at < date_trunc('month', now())) as last_month_completed;
END;
$$;

-- ============================================================================
-- FUNCTION: Brigade performance metrics
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_brigade_performance()
RETURNS TABLE(
  brigade_id uuid,
  brigade_name text,
  total_assigned bigint,
  total_completed bigint,
  total_in_progress bigint,
  avg_completion_hours numeric,
  completion_rate numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id as brigade_id,
    b.name as brigade_name,
    count(r.id) as total_assigned,
    count(r.id) FILTER (WHERE r.status = 'completed') as total_completed,
    count(r.id) FILTER (WHERE r.status IN ('approved', 'in_progress')) as total_in_progress,
    round(avg(
      CASE WHEN r.status = 'completed' AND r.resolved_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (r.resolved_at - r.reported_at)) / 3600
        ELSE NULL
      END
    )::numeric, 1) as avg_completion_hours,
    round(
      count(r.id) FILTER (WHERE r.status = 'completed')::numeric
      / nullif(count(r.id)::numeric, 0) * 100, 1
    ) as completion_rate
  FROM public.brigades b
  LEFT JOIN public.reports r ON r.assigned_brigade_id = b.id
  WHERE b.organization_id = public.get_user_org_id()
    AND b.is_active = true
  GROUP BY b.id, b.name
  ORDER BY total_assigned DESC;
END;
$$;

-- ============================================================================
-- FUNCTION: SLA compliance (based on severity response_days)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_sla_compliance()
RETURNS TABLE(
  severity_level text,
  severity_name text,
  target_days integer,
  total_reports bigint,
  within_sla bigint,
  breached bigint,
  compliance_rate numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.level::text as severity_level,
    ds.name as severity_name,
    ds.response_days as target_days,
    count(r.id) as total_reports,
    count(r.id) FILTER (
      WHERE r.status = 'completed'
        AND r.resolved_at IS NOT NULL
        AND (r.resolved_at - r.reported_at) <= (ds.response_days || ' days')::interval
    ) as within_sla,
    count(r.id) FILTER (
      WHERE (
        r.status = 'completed'
        AND r.resolved_at IS NOT NULL
        AND (r.resolved_at - r.reported_at) > (ds.response_days || ' days')::interval
      ) OR (
        r.status NOT IN ('completed', 'rejected', 'cancelled')
        AND (now() - r.reported_at) > (ds.response_days || ' days')::interval
      )
    ) as breached,
    round(
      count(r.id) FILTER (
        WHERE r.status = 'completed'
          AND r.resolved_at IS NOT NULL
          AND (r.resolved_at - r.reported_at) <= (ds.response_days || ' days')::interval
      )::numeric
      / nullif(count(r.id)::numeric, 0) * 100, 1
    ) as compliance_rate
  FROM public.damage_severities ds
  LEFT JOIN public.reports r ON r.severity_id = ds.id
    AND r.organization_id = public.get_user_org_id()
  GROUP BY ds.level, ds.name, ds.response_days, ds.sort_order
  ORDER BY ds.sort_order;
END;
$$;

-- ============================================================================
-- FUNCTION: Reports by zone (for heatmap/chart)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_reports_by_zone()
RETURNS TABLE(
  zone_id uuid,
  zone_name text,
  total bigint,
  completed bigint,
  pending bigint,
  critical bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    z.id as zone_id,
    z.name as zone_name,
    count(r.id) as total,
    count(r.id) FILTER (WHERE r.status = 'completed') as completed,
    count(r.id) FILTER (WHERE r.status NOT IN ('completed', 'rejected', 'cancelled')) as pending,
    count(r.id) FILTER (WHERE ds.level = 'critical' AND r.status NOT IN ('completed', 'rejected', 'cancelled')) as critical
  FROM public.zones z
  LEFT JOIN public.reports r ON r.zone_id = z.id
  LEFT JOIN public.damage_severities ds ON ds.id = r.severity_id
  WHERE z.organization_id = public.get_user_org_id()
    AND z.is_active = true
  GROUP BY z.id, z.name
  ORDER BY total DESC;
END;
$$;

-- ============================================================================
-- STORAGE: Organization logos bucket
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'org-logos',
  'org-logos',
  true,
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public read, only org admin can upload/delete
CREATE POLICY "storage_org_logos_select"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'org-logos');

CREATE POLICY "storage_org_logos_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'org-logos'
    AND (
      public.is_super_admin()
      OR (
        (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'organization_id')
        AND public.get_user_role() = 'admin'
      )
    )
  );

CREATE POLICY "storage_org_logos_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'org-logos'
    AND (
      public.is_super_admin()
      OR (
        (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'organization_id')
        AND public.get_user_role() = 'admin'
      )
    )
  );
