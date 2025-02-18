/*
  # Create storage policies for avatar uploads

  1. Changes
    - Create storage policies for the avatars bucket
    - Allow authenticated users to upload and manage their own avatars
    - Allow public access to view avatars

  2. Security
    - Enable RLS for storage
    - Add policies for authenticated users
    - Add policies for public access
*/

-- Create storage policies for avatars bucket
DO $$ 
BEGIN
  -- Create avatars bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

  -- Enable RLS
  UPDATE storage.buckets
  SET public = true
  WHERE id = 'avatars';
END $$;

-- Create policies for avatar management
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );