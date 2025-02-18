import React, { useEffect, useState } from 'react';
import { LogOut, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [albumCover, setAlbumCover] = useState(null);
  const [songFile, setSongFile] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, email, is_admin');
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('id, title, artist, cover_url, audio_url, duration');

      if (usersError || songsError) throw usersError || songsError;
      setUsers(usersData || []);
      setSongs(songsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSongUpload = async () => {
    if (!songTitle || !artist || !albumCover || !songFile) return;
    setUploading(true);

    try {
      // Get song duration
      const getAudioDuration = (file) => {
        return new Promise((resolve, reject) => {
          const audio = new Audio();
          audio.preload = 'metadata';
          audio.src = URL.createObjectURL(file);
          audio.onloadedmetadata = () => {
            resolve(Math.round(audio.duration));
          };
          audio.onerror = (err) => reject(err);
        });
      };

      const duration = await getAudioDuration(songFile);

      // Upload album cover
      const coverExt = albumCover.name.split('.').pop();
      const coverPath = `albums/${Date.now()}.${coverExt}`;
      const { data: coverData, error: coverError } = await supabase.storage
        .from('album_covers')
        .upload(coverPath, albumCover);
      if (coverError) throw coverError;
      const coverUrl = supabase.storage
        .from('album_covers')
        .getPublicUrl(coverPath).data.publicUrl;

      // Upload song file
      const songExt = songFile.name.split('.').pop();
      const songPath = `songs/${Date.now()}.${songExt}`;
      const { data: songData, error: songError } = await supabase.storage
        .from('songs')
        .upload(songPath, songFile);
      if (songError) throw songError;
      const audioUrl = supabase.storage.from('songs').getPublicUrl(songPath)
        .data.publicUrl;

      // Insert into database
      const { error: insertError } = await supabase.from('songs').insert([
        {
          title: songTitle,
          artist,
          cover_url: coverUrl,
          audio_url: audioUrl,
          duration,
        },
      ]);
      if (insertError) throw insertError;

      alert('Song uploaded successfully!');
      setSongTitle('');
      setArtist('');
      setAlbumCover(null);
      setSongFile(null);
      fetchAdminData();
    } catch (error) {
      console.error('Error uploading song:', error);
    } finally {
      setUploading(false);
    }
  };

  const deleteSong = async (id) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return;
    try {
      const { error } = await supabase.from('songs').delete().eq('id', id);
      if (error) throw error;
      setSongs(songs.filter((song) => song.id !== id));
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button className="flex items-center gap-2 text-gray-400 hover:text-white">
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      <div className="bg-white/5 rounded-lg p-6 space-y-6">
        {/* Manage Users */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition group"
              >
                <h3 className="font-semibold">{user.username}</h3>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Upload Songs */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Upload Songs</h2>
          <input
            type="text"
            placeholder="Song Title"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            className="w-full mb-2 p-2 rounded bg-gray-800 text-white"
          />
          <input
            type="text"
            placeholder="Artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full mb-2 p-2 rounded bg-gray-800 text-white"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAlbumCover(e.target.files[0])}
            className="w-full mb-2 p-2"
          />
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setSongFile(e.target.files[0])}
            className="w-full mb-2 p-2"
          />
          <button
            onClick={handleSongUpload}
            className="bg-purple-600 text-white rounded-lg py-2 px-4 hover:bg-purple-700 transition"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Song & Cover'}
          </button>
        </section>

        {/* Manage Songs */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Manage Songs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {songs.map((song) => (
              <div
                key={song.id}
                className="bg-white/5 p-4 rounded-lg flex items-center gap-4 hover:bg-white/10 transition group"
              >
                <img
                  src={song.cover_url}
                  alt="Cover"
                  className="w-16 h-16 rounded"
                />
                <div>
                  <h3 className="font-semibold">{song.title}</h3>
                  <p className="text-sm text-gray-400">{song.artist}</p>
                  <p className="text-sm text-gray-500">{song.duration}s</p>
                </div>
                <button
                  onClick={() => deleteSong(song.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;