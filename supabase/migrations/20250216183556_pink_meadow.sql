/*
  # Initial Schema Setup for Music Player

  1. New Tables
    - profiles
      - id (uuid, primary key)
      - username (text)
      - avatar_url (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - songs
      - id (uuid, primary key)
      - title (text)
      - artist (text)
      - album (text)
      - duration (integer)
      - cover_url (text)
      - audio_url (text)
      - user_id (uuid, foreign key)
      - created_at (timestamp)
    
    - playlists
      - id (uuid, primary key)
      - name (text)
      - user_id (uuid, foreign key)
      - created_at (timestamp)
    
    - playlist_songs
      - playlist_id (uuid, foreign key)
      - song_id (uuid, foreign key)
      - position (integer)
      - added_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access
*/

-- Create profiles table
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    username text UNIQUE,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create songs table
CREATE TABLE songs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    artist text NOT NULL,
    album text,
    duration integer NOT NULL,
    cover_url text,
    audio_url text NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);

-- Create playlists table
CREATE TABLE playlists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);

-- Create playlist_songs junction table
CREATE TABLE playlist_songs (
    playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
    song_id uuid REFERENCES songs(id) ON DELETE CASCADE,
    position integer NOT NULL,
    added_at timestamptz DEFAULT now(),
    PRIMARY KEY (playlist_id, song_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can view all songs"
    ON songs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert own songs"
    ON songs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own playlists"
    ON playlists FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own playlists"
    ON playlists FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view playlist songs"
    ON playlist_songs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM playlists
            WHERE id = playlist_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage playlist songs"
    ON playlist_songs FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM playlists
            WHERE id = playlist_id
            AND user_id = auth.uid()
        )
    );