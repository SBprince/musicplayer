import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="flex items-center justify-around py-3 px-4">
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 ${
          isActive('/') ? 'text-purple-500' : 'text-gray-400'
        }`}
      >
        <Home size={24} />
        <span className="text-xs">Home</span>
      </Link>
      
      <Link
        to="/search"
        className={`flex flex-col items-center gap-1 ${
          isActive('/search') ? 'text-purple-500' : 'text-gray-400'
        }`}
      >
        <Search size={24} />
        <span className="text-xs">Search</span>
      </Link>
      
      <Link
        to="/library"
        className={`flex flex-col items-center gap-1 ${
          isActive('/library') ? 'text-purple-500' : 'text-gray-400'
        }`}
      >
        <Library size={24} />
        <span className="text-xs">Library</span>
      </Link>
      
      <Link
        to="/profile"
        className={`flex flex-col items-center gap-1 ${
          isActive('/profile') ? 'text-purple-500' : 'text-gray-400'
        }`}
      >
        <User size={24} />
        <span className="text-xs">Profile</span>
      </Link>
    </nav>
  );
};