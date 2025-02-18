import React from 'react';
import { Clock, MoreVertical } from 'lucide-react';

export const Library: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your Library</h1>

      <div className="bg-white/5 rounded-lg">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-6">
            <img
              src="https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=200&h=200&fit=crop"
              alt="Playlist cover"
              className="w-40 h-40 rounded-lg shadow-lg"
            />
            <div>
              <span className="text-sm text-gray-400">PLAYLIST</span>
              <h2 className="text-4xl font-bold mt-2 mb-4">Liked Songs</h2>
              <p className="text-gray-400">234 songs</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                <th className="pb-4 font-medium">#</th>
                <th className="pb-4 font-medium">TITLE</th>
                <th className="pb-4 font-medium">ALBUM</th>
                <th className="pb-4 font-medium">DATE ADDED</th>
                <th className="pb-4 font-medium"><Clock size={16} /></th>
                <th className="pb-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="group hover:bg-white/5">
                  <td className="py-4">{i}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=40&h=40&fit=crop`}
                        alt="Song cover"
                        className="w-10 h-10 rounded"
                      />
                      <div>
                        <div className="font-medium group-hover:text-purple-500">
                          Song Title {i}
                        </div>
                        <div className="text-sm text-gray-400">Artist Name</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-gray-400">Album Name</td>
                  <td className="py-4 text-gray-400">2 days ago</td>
                  <td className="py-4 text-gray-400">3:45</td>
                  <td className="py-4">
                    <button className="opacity-0 group-hover:opacity-100 transition">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};