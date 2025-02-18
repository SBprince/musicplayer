import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, PlusCircle, Heart, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      setIsAdmin(!!data?.is_admin);
    }

    checkAdmin();
  }, [user]);

  return (
    <div className="w-64 bg-black/95 h-screen p-6 text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">BlackHole</h1>
      </div>
      
      <nav className="space-y-6">
        <div className="space-y-3">
          <Link
            to="/"
            className={`flex items-center gap-3 hover:text-purple-500 ${
              location.pathname === '/' ? 'text-purple-500' : ''
            }`}
          >
            <Home size={20} />
            Home
          </Link>
          <Link
            to="/search"
            className={`flex items-center gap-3 hover:text-purple-500 ${
              location.pathname === '/search' ? 'text-purple-500' : ''
            }`}
          >
            <Search size={20} />
            Search
          </Link>
          <Link
            to="/library"
            className={`flex items-center gap-3 hover:text-purple-500 ${
              location.pathname === '/library' ? 'text-purple-500' : ''
            }`}
          >
            <Library size={20} />
            Your Library
          </Link>
        </div>
        
        <div className="space-y-3">
          <button className="flex items-center gap-3 hover:text-purple-500">
            <PlusCircle size={20} />
            Create Playlist
          </button>
          <Link
            to="/liked"
            className={`flex items-center gap-3 hover:text-purple-500 ${
              location.pathname === '/liked' ? 'text-purple-500' : ''
            }`}
          >
            <Heart size={20} />
            Liked Songs
          </Link>
        </div>

        {isAdmin && (
          <div className="pt-6 border-t border-white/10">
            <Link
              to="/admin"
              className={`flex items-center gap-3 hover:text-purple-500 ${
                location.pathname === '/admin' ? 'text-purple-500' : ''
              }`}
            >
              <Settings size={20} />
              Admin Panel
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};