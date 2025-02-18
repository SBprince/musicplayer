export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover_url: string;
  audio_url: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  email?: string;
  avatar_url: string;
  is_admin: boolean;
  created_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  user_id: string;
  songs: Song[];
  created_at: string;
}