-- ==============================================================================
-- SOUL TRIBE: PRIVATE AVATARS STORAGE BUCKET & RLS POLICIES
-- ==============================================================================

-- 1. Create Private Storage Bucket for Avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  false, -- PRIVATE bucket (not public)
  4194304, -- Server-side 4 MB file size cap
  ARRAY['image/jpeg', 'image/png', 'image/webp'] -- Server-side MIME type enforcement
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 4194304,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Enable Row Level Security on Storage Objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated members may READ avatars
CREATE POLICY "Authenticated members can view avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

-- Policy 2: User may INSERT only into their own folder (avatars/{auth.uid()}/...)
CREATE POLICY "Users can upload avatar to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: User may UPDATE only their own folder
CREATE POLICY "Users can update avatar in own folder"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4: User may DELETE only their own folder
CREATE POLICY "Users can delete avatar from own folder"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
