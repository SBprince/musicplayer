/*
  # Add album covers storage bucket

  1. Changes
    - Create new storage bucket for album covers
    - Set appropriate security policies
  
  2. Security
    - Enable public access for viewing album covers
    - Restrict upload/delete to admin users only
*/

-- Create album_covers storage bucket
DO $$ 
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('album_covers', 'album_covers', true)
  ON CONFLICT (id) DO NOTHING;

  UPDATE storage.buckets
  SET public = true
  WHERE id = 'album_covers';
END $$;

-- Create storage policies for album covers
CREATE POLICY "Album covers are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'album_covers');

CREATE POLICY "Only admins can manage album covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'album_covers' 
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Only admins can delete album covers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'album_covers' 
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );