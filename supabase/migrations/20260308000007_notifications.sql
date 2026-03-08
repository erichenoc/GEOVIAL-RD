-- Migration: 20260308000007_notifications.sql
-- Description: Notification system with auto-creation triggers
-- Date: 2026-03-08

-- ============================================================================
-- TABLE: notifications
-- ============================================================================

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  data jsonb DEFAULT '{}',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT valid_notification_type CHECK (
    type IN (
      'report_submitted',
      'report_assigned',
      'status_changed',
      'brigade_assigned',
      'comment_added',
      'report_completed',
      'invitation_received',
      'sla_warning',
      'sla_breached'
    )
  )
);

CREATE INDEX idx_notifications_user ON public.notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_org ON public.notifications (organization_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "notifications_select"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR user_id = auth.uid()
  );

-- System inserts via triggers (SECURITY DEFINER), but allow manual insert too
CREATE POLICY "notifications_insert"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR organization_id = public.get_user_org_id()
  );

-- Users can mark their own as read
CREATE POLICY "notifications_update"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own
CREATE POLICY "notifications_delete"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

-- ============================================================================
-- FUNCTION: Mark all notifications as read for current user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.notifications
  SET read_at = now()
  WHERE user_id = auth.uid()
    AND read_at IS NULL;
END;
$$;

-- ============================================================================
-- FUNCTION: Get unread notification count
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT count(*)::integer
  FROM public.notifications
  WHERE user_id = (SELECT auth.uid())
    AND read_at IS NULL;
$$;

-- ============================================================================
-- TRIGGER: Notify supervisors when a new report is submitted
-- ============================================================================

CREATE OR REPLACE FUNCTION public.notify_on_report_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  supervisor_record record;
  reporter_name text;
BEGIN
  -- Only trigger on status change to 'submitted'
  IF NEW.status != 'submitted' THEN
    RETURN NEW;
  END IF;

  -- Get reporter name
  SELECT first_name || ' ' || last_name INTO reporter_name
  FROM public.user_profiles WHERE id = NEW.reported_by;

  -- Notify all supervisors and admins in the organization
  FOR supervisor_record IN
    SELECT id FROM public.user_profiles
    WHERE organization_id = NEW.organization_id
      AND role IN ('supervisor', 'admin', 'gerente')
      AND is_active = true
      AND deleted_at IS NULL
  LOOP
    INSERT INTO public.notifications (organization_id, user_id, type, title, body, data)
    VALUES (
      NEW.organization_id,
      supervisor_record.id,
      'report_submitted',
      'Nuevo reporte recibido',
      'Reporte ' || NEW.report_number || ' enviado por ' || reporter_name,
      jsonb_build_object('report_id', NEW.id, 'report_number', NEW.report_number)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_report_submitted
  AFTER INSERT OR UPDATE OF status ON public.reports
  FOR EACH ROW
  WHEN (NEW.status = 'submitted')
  EXECUTE FUNCTION public.notify_on_report_submitted();

-- ============================================================================
-- TRIGGER: Notify inspector when their report status changes
-- ============================================================================

CREATE OR REPLACE FUNCTION public.notify_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  changer_name text;
BEGIN
  -- Skip if status didn't actually change or if it's the initial submission
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;
  IF NEW.status = 'submitted' THEN
    RETURN NEW; -- Handled by notify_on_report_submitted
  END IF;

  -- Get who changed it
  SELECT first_name || ' ' || last_name INTO changer_name
  FROM public.user_profiles WHERE id = auth.uid();

  -- Notify the reporter
  IF NEW.reported_by != auth.uid() THEN
    INSERT INTO public.notifications (organization_id, user_id, type, title, body, data)
    VALUES (
      NEW.organization_id,
      NEW.reported_by,
      'status_changed',
      'Estatus actualizado: ' || NEW.report_number,
      'Cambiado a "' || NEW.status || '" por ' || coalesce(changer_name, 'Sistema'),
      jsonb_build_object(
        'report_id', NEW.id,
        'report_number', NEW.report_number,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;

  -- If brigade assigned, notify brigade leader
  IF NEW.assigned_brigade_id IS NOT NULL AND OLD.assigned_brigade_id IS DISTINCT FROM NEW.assigned_brigade_id THEN
    INSERT INTO public.notifications (organization_id, user_id, type, title, body, data)
    SELECT
      NEW.organization_id,
      bm.user_id,
      'brigade_assigned',
      'Brigada asignada a reporte ' || NEW.report_number,
      'Tu brigada ha sido asignada al reporte ' || NEW.report_number,
      jsonb_build_object('report_id', NEW.id, 'report_number', NEW.report_number, 'brigade_id', NEW.assigned_brigade_id)
    FROM public.brigade_members bm
    WHERE bm.brigade_id = NEW.assigned_brigade_id
      AND bm.is_leader = true;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_report_status_change
  AFTER UPDATE OF status, assigned_brigade_id ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_status_change();
