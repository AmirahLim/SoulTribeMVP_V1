-- ==============================================================================
-- SOUL TRIBE: OUTING COVER IMAGES & ATTRIBUTION COLUMNS
-- Migration Timestamp: 20260907000000
-- ==============================================================================

-- 1. Add Unsplash & Custom Cover Image Columns to `outings` Table
ALTER TABLE outings ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE outings ADD COLUMN IF NOT EXISTS cover_image_thumb_url text;
ALTER TABLE outings ADD COLUMN IF NOT EXISTS cover_image_alt text;
ALTER TABLE outings ADD COLUMN IF NOT EXISTS cover_photographer_name text;
ALTER TABLE outings ADD COLUMN IF NOT EXISTS cover_photographer_url text;
ALTER TABLE outings ADD COLUMN IF NOT EXISTS cover_download_location text;

-- 2. Create Storage Bucket for Host-Uploaded Custom Outing Covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'outing-covers',
  'outing-covers',
  true, -- Public read for outing cover banners
  20971520, -- 20 MB raw camera photo cap
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

-- 3. Storage RLS Policies for `outing-covers`
-- Policy 1: Anyone (authenticated or public) can read cover images
CREATE POLICY "Public read for outing covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'outing-covers');

-- Policy 2: Authenticated hosts can insert cover images into their own folder (outing-covers/{auth.uid()}/...)
CREATE POLICY "Hosts can upload outing covers to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'outing-covers'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Hosts can update cover images in their own folder
CREATE POLICY "Hosts can update outing covers in own folder"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'outing-covers'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4: Hosts can delete cover images from their own folder
CREATE POLICY "Hosts can delete outing covers from own folder"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'outing-covers'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
