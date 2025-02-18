import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Player } from './components/Player';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Library } from './pages/Library';
import { Profile } from './pages/Profile';
import AdminPanel from './pages/Admin';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';

function App() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, [setUser]);

  return (
    <Router>
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        {/* Sidebar for desktop */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        <main className="flex-1 overflow-auto pb-28 md:pb-28 lg:pb-28">
          <div className="h-full p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/library" element={<Library />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </div>
        </main>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-[72px] left-0 right-0 bg-black/95 border-t border-white/10">
          <MobileNav />
        </div>

        {/* Player */}
        <div className="fixed bottom-0 left-0 right-0">
          <Player />
        </div>
      </div>
    </Router>
  );
}

export default App;