-- Migration: 20260308000011_messaging.sql
-- Description: Internal messaging system with text, voice notes, channels, and presence
-- Date: 2026-03-08

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE public.channel_type AS ENUM (
  'direct',      -- 1-to-1 conversation
  'brigade',     -- Auto-created channel for each brigade
  'zone',        -- Auto-created channel for each zone
  'general',     -- Org-wide general channel
  'report'       -- Discussion channel linked to a specific report
);

CREATE TYPE public.message_type AS ENUM (
  'text',
  'voice',
  'image',
  'system'       -- System messages like "X joined the channel"
);

-- ============================================================================
-- TABLE: chat_channels
-- ============================================================================

CREATE TABLE public.chat_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  type public.channel_type NOT NULL DEFAULT 'direct',
  name text,                              -- NULL for direct messages
  description text,

  -- Linked entities (optional, for context channels)
  brigade_id uuid REFERENCES public.brigades(id) ON DELETE SET NULL,
  zone_id uuid REFERENCES public.zones(id) ON DELETE SET NULL,
  report_id uuid REFERENCES public.reports(id) ON DELETE SET NULL,

  -- Metadata
  is_active boolean NOT NULL DEFAULT true,
  last_message_at timestamptz,
  created_by uuid REFERENCES public.user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_channels_org ON public.chat_channels (organization_id);
CREATE INDEX idx_chat_channels_type ON public.chat_channels (organization_id, type);
CREATE INDEX idx_chat_channels_brigade ON public.chat_channels (brigade_id) WHERE brigade_id IS NOT NULL;
CREATE INDEX idx_chat_channels_zone ON public.chat_channels (zone_id) WHERE zone_id IS NOT NULL;
CREATE INDEX idx_chat_channels_report ON public.chat_channels (report_id) WHERE report_id IS NOT NULL;
CREATE INDEX idx_chat_channels_last_msg ON public.chat_channels (organization_id, last_message_at DESC NULLS LAST);

-- ============================================================================
-- TABLE: channel_participants
-- ============================================================================

CREATE TABLE public.channel_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),

  -- Per-participant state
  last_read_at timestamptz DEFAULT now(),
  is_muted boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_participant UNIQUE (channel_id, user_id)
);

CREATE INDEX idx_channel_participants_user ON public.channel_participants (user_id);
CREATE INDEX idx_channel_participants_channel ON public.channel_participants (channel_id);
CREATE INDEX idx_channel_participants_org ON public.channel_participants (organization_id);

-- ============================================================================
-- TABLE: chat_messages
-- ============================================================================

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  sender_id uuid NOT NULL REFERENCES public.user_profiles(id),

  -- Content
  type public.message_type NOT NULL DEFAULT 'text',
  content text,                           -- Text content or system message

  -- Voice note
  voice_url text,                         -- Storage path for voice recording
  voice_duration_seconds integer,         -- Duration in seconds

  -- Image attachment
  image_url text,                         -- Storage path for image
  image_caption text,

  -- Reply to another message
  reply_to_id uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,

  -- Metadata
  is_edited boolean NOT NULL DEFAULT false,
  edited_at timestamptz,
  deleted_at timestamptz,                 -- Soft delete
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_channel ON public.chat_messages (channel_id, created_at DESC);
CREATE INDEX idx_chat_messages_org ON public.chat_messages (organization_id);
CREATE INDEX idx_chat_messages_sender ON public.chat_messages (sender_id);

-- ============================================================================
-- TABLE: user_presence (online/offline tracking)
-- ============================================================================

CREATE TABLE public.user_presence (
  user_id uuid PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  status text NOT NULL DEFAULT 'offline',  -- 'online', 'away', 'offline'
  last_seen_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT valid_presence_status CHECK (status IN ('online', 'away', 'offline'))
);

CREATE INDEX idx_user_presence_org ON public.user_presence (organization_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Channels: see channels in your org that you're a participant of (or admin sees all)
CREATE POLICY "chat_channels_select" ON public.chat_channels FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND (
        public.get_user_role() IN ('admin', 'gerente')
        OR id IN (SELECT channel_id FROM public.channel_participants WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "chat_channels_insert" ON public.chat_channels FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_user_org_id()
    AND public.get_user_role() IN ('admin', 'gerente', 'supervisor')
  );

CREATE POLICY "chat_channels_update" ON public.chat_channels FOR UPDATE TO authenticated
  USING (
    organization_id = public.get_user_org_id()
    AND (public.get_user_role() IN ('admin', 'gerente') OR created_by = auth.uid())
  );

-- Participants
CREATE POLICY "channel_participants_select" ON public.channel_participants FOR SELECT TO authenticated
  USING (organization_id = public.get_user_org_id() OR public.is_super_admin());

CREATE POLICY "channel_participants_insert" ON public.channel_participants FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.get_user_org_id());

CREATE POLICY "channel_participants_update" ON public.channel_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "channel_participants_delete" ON public.channel_participants FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR (organization_id = public.get_user_org_id() AND public.get_user_role() IN ('admin', 'supervisor'))
  );

-- Messages: see messages in channels you're part of
CREATE POLICY "chat_messages_select" ON public.chat_messages FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_org_id()
      AND channel_id IN (SELECT channel_id FROM public.channel_participants WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "chat_messages_insert" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_user_org_id()
    AND channel_id IN (SELECT channel_id FROM public.channel_participants WHERE user_id = auth.uid())
  );

-- Can edit/soft-delete own messages
CREATE POLICY "chat_messages_update" ON public.chat_messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid() OR (organization_id = public.get_user_org_id() AND public.get_user_role() = 'admin'));

-- Presence: everyone in org can see, only own can update
CREATE POLICY "user_presence_select" ON public.user_presence FOR SELECT TO authenticated
  USING (organization_id = public.get_user_org_id() OR public.is_super_admin());

CREATE POLICY "user_presence_upsert" ON public.user_presence FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_presence_update" ON public.user_presence FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update channel's last_message_at when a new message is sent
CREATE OR REPLACE FUNCTION public.update_channel_last_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.chat_channels
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.channel_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_chat_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_channel_last_message();

-- Auto-create general channel when org is created
CREATE OR REPLACE FUNCTION public.create_org_general_channel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.chat_channels (organization_id, type, name, description)
  VALUES (NEW.id, 'general', 'General', 'Canal general de la organizacion');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_org_created_chat
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_org_general_channel();

-- Auto-create brigade channel when brigade is created
CREATE OR REPLACE FUNCTION public.create_brigade_channel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.chat_channels (organization_id, type, name, description, brigade_id)
  VALUES (NEW.organization_id, 'brigade', 'Brigada: ' || NEW.name, 'Canal de la brigada ' || NEW.name, NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_brigade_created_chat
  AFTER INSERT ON public.brigades
  FOR EACH ROW
  EXECUTE FUNCTION public.create_brigade_channel();

-- Auto-add user to general channel when they join the org
CREATE OR REPLACE FUNCTION public.add_user_to_general_channel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  general_channel_id uuid;
BEGIN
  SELECT id INTO general_channel_id
  FROM public.chat_channels
  WHERE organization_id = NEW.organization_id
    AND type = 'general'
  LIMIT 1;

  IF general_channel_id IS NOT NULL THEN
    INSERT INTO public.channel_participants (channel_id, user_id, organization_id)
    VALUES (general_channel_id, NEW.id, NEW.organization_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Initialize presence
  INSERT INTO public.user_presence (user_id, organization_id, status)
  VALUES (NEW.id, NEW.organization_id, 'offline')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_joined_org_chat
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.add_user_to_general_channel();

-- ============================================================================
-- STORAGE: Voice notes bucket
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-notes',
  'voice-notes',
  false,
  5242880,  -- 5MB (about 2 min of audio)
  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for voice notes (same pattern as report photos)
CREATE POLICY "storage_voice_notes_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'voice-notes'
    AND (
      public.is_super_admin()
      OR (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'organization_id')
    )
  );

CREATE POLICY "storage_voice_notes_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'voice-notes'
    AND (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'organization_id')
  );

CREATE POLICY "storage_voice_notes_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'voice-notes'
    AND (
      public.is_super_admin()
      OR (
        (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'organization_id')
        AND public.get_user_role() = 'admin'
      )
    )
  );

-- ============================================================================
-- FUNCTION: Get unread message count per channel for current user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_unread_message_counts()
RETURNS TABLE(channel_id uuid, unread_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.channel_id,
    count(cm.id) as unread_count
  FROM public.channel_participants cp
  LEFT JOIN public.chat_messages cm ON cm.channel_id = cp.channel_id
    AND cm.created_at > coalesce(cp.last_read_at, '1970-01-01'::timestamptz)
    AND cm.sender_id != auth.uid()
    AND cm.deleted_at IS NULL
  WHERE cp.user_id = auth.uid()
  GROUP BY cp.channel_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Create or get direct message channel between two users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_or_create_direct_channel(p_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  existing_channel_id uuid;
  new_channel_id uuid;
  caller_org_id uuid;
BEGIN
  caller_org_id := public.get_user_org_id();

  -- Check if DM channel already exists between these two users
  SELECT cc.id INTO existing_channel_id
  FROM public.chat_channels cc
  JOIN public.channel_participants cp1 ON cp1.channel_id = cc.id AND cp1.user_id = auth.uid()
  JOIN public.channel_participants cp2 ON cp2.channel_id = cc.id AND cp2.user_id = p_other_user_id
  WHERE cc.type = 'direct'
    AND cc.organization_id = caller_org_id
  LIMIT 1;

  IF existing_channel_id IS NOT NULL THEN
    RETURN existing_channel_id;
  END IF;

  -- Create new DM channel
  INSERT INTO public.chat_channels (organization_id, type, created_by)
  VALUES (caller_org_id, 'direct', auth.uid())
  RETURNING id INTO new_channel_id;

  -- Add both participants
  INSERT INTO public.channel_participants (channel_id, user_id, organization_id)
  VALUES
    (new_channel_id, auth.uid(), caller_org_id),
    (new_channel_id, p_other_user_id, caller_org_id);

  RETURN new_channel_id;
END;
$$;
