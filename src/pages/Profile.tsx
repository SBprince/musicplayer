import React, { useState, useEffect } from 'react';
import { Camera, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'; 


export const Profile: React.FC = () => {
  const { user, signIn, signUp, signOut } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    avatar_url: '',
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load or create profile when user is authenticated
useEffect(() => {
  async function loadOrCreateProfile() {
    if (!user) return;

    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const defaultUsername = user.email?.split('@')[0] || 'user';
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, username: defaultUsername, avatar_url: '' }])
          .select()
          .single();

        if (createError) throw createError;
        data = newProfile;
      } else if (error) {
        throw error;
      }

      if (data) {
        setFormData((prev) => ({
          ...prev,
          username: data.username || '',
          avatar_url: data.avatar_url || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  loadOrCreateProfile();
}, [user]);

// ✅ Handle Redirecting the User
const navigate = useNavigate();
const location = useLocation();

useEffect(() => {
  if (!user) return;

  // Stay on profile page after sign-up
  if (isSignUp) return;

  // ✅ Only redirect if the user just logged in (not if they clicked Profile manually)
  const previousPath = location.state?.from?.pathname;

  if (previousPath && previousPath !== '/profile') {
    navigate('/');
  }
}, [user, isSignUp, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password);
        // Stay on the profile page after sign-up for setting up username/avatar
      } else {
        await signIn(formData.email, formData.password);
        // Redirect to home page after signing in
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: formData.username,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsLoading(true);
      
      // Upload image
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update form data with new avatar URL
      setFormData(prev => ({
        ...prev,
        avatar_url: publicUrl,
      }));

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;
      
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white rounded-lg py-2 hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
          
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-sm text-gray-400 hover:text-white"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
      
      <div className="bg-white/5 rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={formData.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Camera size={16} />
            </label>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Enter your username"
            />
          </div>
        </div>
        
        <button
          onClick={handleUpdateProfile}
          disabled={isLoading}
          className="w-full bg-purple-600 text-white rounded-lg py-2 hover:bg-purple-700 transition disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      <div className="mt-8 bg-white/5 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Music</h2>
        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            id="music-upload"
          />
          <label
            htmlFor="music-upload"
            className="cursor-pointer inline-block"
          >
            <div className="text-purple-500 mb-2">Click to upload</div>
            <div className="text-sm text-gray-400">
              Supported formats: MP3, WAV (max 10MB)
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};