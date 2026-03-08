-- Migration: 20260308000005_storage_policies.sql
-- Description: Storage bucket and RLS policies for report photos
-- Date: 2026-03-08
--
-- Supabase Storage uses a folder-based tenant isolation strategy:
-- Path: report-photos/{organization_id}/{report_id}/{filename}
-- The first folder segment MUST match the user's organization_id from JWT.

-- ============================================================================
-- CREATE STORAGE BUCKET
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-photos',
  'report-photos',
  false,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE RLS POLICIES
-- ============================================================================

-- SELECT (download): users can only download photos from their org folder
CREATE POLICY "storage_report_photos_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'report-photos'
    AND (
      public.is_super_admin()
      OR (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'organization_id')
    )
  );

-- INSERT (upload): users can only upload to their org folder
CREATE POLICY "storage_report_photos_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'report-photos'
    AND (
      public.is_super_admin()
      OR (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'organization_id')
    )
  );

-- UPDATE (replace): same org restriction
CREATE POLICY "storage_report_photos_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'report-photos'
    AND (
      public.is_super_admin()
      OR (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'organization_id')
    )
  );

-- DELETE: only admin/gerente can delete photos from their org
CREATE POLICY "storage_report_photos_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'report-photos'
    AND (
      public.is_super_admin()
      OR (
        (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'organization_id')
        AND public.get_user_role() IN ('admin', 'gerente')
      )
    )
  );
