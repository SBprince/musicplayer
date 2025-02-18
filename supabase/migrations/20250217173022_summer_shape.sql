/*
  # Add admin features and policies

  1. Changes
    - Add admin flag to profiles table
    - Create admin-specific policies
    - Create songs bucket for music storage
    - Add storage policies for song management

  2. Security
    - Only admins can manage users and content
    - Enable RLS for all new features
*/

-- Add admin column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create songs storage bucket
DO $$ 
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('songs', 'songs', true)
  ON CONFLICT (id) DO NOTHING;

  UPDATE storage.buckets
  SET public = true
  WHERE id = 'songs';
END $$;

-- Create storage policies for songs
CREATE POLICY "Song files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'songs');

CREATE POLICY "Only admins can manage song files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'songs' 
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Add admin-specific policies
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage all songs"
  ON songs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );