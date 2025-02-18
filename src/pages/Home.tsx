import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import type { Song } from '../types';

export const Home: React.FC = () => {
  const { user } = useAuthStore();
  const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          setLoading(true);
          
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();
          if (profileError) throw profileError;
          setAvatarUrl(profile?.avatar_url || '');

          // Fetch songs
          const { data: songs, error: songsError } = await supabase
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });
          if (songsError) throw songsError;
          setAllSongs(songs || []);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Ensuring loading state is false for unauthenticated users
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handlePlayPause = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      setCurrentSong(song);
    }
  };

  // Group songs by artist
  const songsByArtist = allSongs.reduce((acc, song) => {
    if (!acc[song.artist]) acc[song.artist] = [];
    acc[song.artist].push(song);
    return acc;
  }, {} as Record<string, Song[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <h1 className="text-3xl font-bold">Welcome to the Music App 🎵</h1>
        <p className="mt-4">Sign in to explore and play your favorite tracks.</p>
        <Link to="/profile">
          <button className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Sign In
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Welcome Back 👋</h1>
          <p className="text-gray-400 mt-2">Discover your favorite music</p>
        </div>
        <Link to="/profile">
          <img
            src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer"
          />
        </Link>
      </header>

      {/* Recently Added */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recently Added</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {allSongs.slice(0, 5).map((song) => (
            <div
              key={song.id}
              className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition group cursor-pointer"
              onClick={() => handlePlayPause(song)}
            >
              <div className="relative">
                <img
                  src={song.cover_url}
                  alt={`${song.title} cover`}
                  className="w-full aspect-square object-cover rounded-lg mb-4"
                />
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  {currentSong?.id === song.id && isPlaying ? (
                    <Pause size={20} className="text-white" />
                  ) : (
                    <Play size={20} className="text-white" fill="white" />
                  )}
                </button>
              </div>
              <h3 className="font-semibold truncate">{song.title}</h3>
              <p className="text-sm text-gray-400 truncate">{song.artist}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by Artist */}
      {Object.entries(songsByArtist).map(([artist, songs]) => (
        <section key={artist}>
          <h2 className="text-2xl font-semibold mb-4">More from {artist}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {songs.map((song) => (
              <div
                key={song.id}
                className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition group cursor-pointer"
                onClick={() => handlePlayPause(song)}
              >
                <div className="relative">
                  <img
                    src={song.cover_url}
                    alt={`${song.title} cover`}
                    className="w-full aspect-square object-cover rounded-lg mb-4"
                  />
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    {currentSong?.id === song.id && isPlaying ? (
                      <Pause size={20} className="text-white" />
                    ) : (
                      <Play size={20} className="text-white" fill="white" />
                    )}
                  </button>
                </div>
                <h3 className="font-semibold truncate">{song.title}</h3>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {allSongs.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-400">No songs available</h3>
          <p className="text-gray-500 mt-2">Songs uploaded by admins will appear here</p>
        </div>
      )}
    </div>
  );
};
