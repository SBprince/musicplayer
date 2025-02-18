import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
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

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const { user, setUser } = useAuthStore();

 // Check if user is authenticated on app load
 useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });
}, [setUser])

  return (
    <Router>
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        {/* Sidebar for logged-in users */}
        {user && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}

        <main className="flex-1 overflow-auto pb-28 md:pb-28 lg:pb-28">
          <div className="h-full p-4 md:p-8">
            <Routes>
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library"
                element={
                  <ProtectedRoute>
                    <Library />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </main>

        {/* Mobile Navigation - Only for logged-in users */}
        {user && (
          <div className="md:hidden fixed bottom-[0px] left-0 right-0 bg-black/95 border-t border-white/10">
            <MobileNav />
          </div>
        )}

        {/* Player - Only for logged-in users */}
        {user && (
          <div className="fixed bottom-0 left-0 right-0">
            <Player />
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
