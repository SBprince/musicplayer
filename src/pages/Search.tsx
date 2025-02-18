import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';

export const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-8">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for songs, artists, or albums"
          className="w-full bg-white/10 rounded-full py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Categories */}
        {['Hip Hop', 'Rock', 'Electronic', 'Pop', 'Jazz', 'Classical', 'R&B', 'Metal'].map((genre) => (
          <div
            key={genre}
            className="aspect-square relative overflow-hidden rounded-lg group cursor-pointer"
            style={{
              backgroundColor: `hsl(${Math.random() * 360}, 70%, 40%)`
            }}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition" />
            <h3 className="absolute bottom-4 left-4 text-xl font-bold">{genre}</h3>
          </div>
        ))}
      </div>

      {searchQuery && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Search Results</h2>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition group"
              >
                <img
                  src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=60&h=60&fit=crop`}
                  alt="Song cover"
                  className="w-12 h-12 rounded"
                />
                <div>
                  <h3 className="font-semibold group-hover:text-purple-500">Song Title {i}</h3>
                  <p className="text-sm text-gray-400">Artist Name</p>
                </div>
                <span className="ml-auto text-sm text-gray-400">3:45</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};