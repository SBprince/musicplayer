import { create } from 'zustand';
import { Song } from '../types';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  setCurrentSong: (song: Song) => void;
  togglePlay: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],

  // Set the current song and start playing
  setCurrentSong: (song) => set({ currentSong: song, isPlaying: true }),

  // Toggle play/pause
  togglePlay: () => {
    const { currentSong, isPlaying } = get();
    if (!currentSong) return; // Prevent toggling when there's no song
    set({ isPlaying: !isPlaying });
  },

  // Add song to the queue
  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),

  // Remove song from queue by ID
  removeFromQueue: (songId) =>
    set((state) => ({
      queue: state.queue.filter((song) => song.id !== songId),
    })),

  // Play the next song in the queue
  playNext: () => {
    const { queue, setCurrentSong } = get();
    if (queue.length === 0) return;
    const [nextSong, ...remainingQueue] = queue;
    set({ currentSong: nextSong, queue: remainingQueue, isPlaying: true });
  },

  // Play the previous song (requires song history tracking)
  playPrevious: () => {
    // For future implementation: track played songs and allow rewinding
  },
}));
