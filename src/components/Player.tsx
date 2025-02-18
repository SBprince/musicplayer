import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

export const Player: React.FC = () => {
  const { currentSong, isPlaying, togglePlay } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.audio_url;
      audioRef.current.load();

      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current?.duration || 0);
      };

      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSong, isPlaying]);

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', updateProgress);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      togglePlay();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = Number(e.target.value);
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  if (!currentSong) return null;

  return (
    <div className="bg-black/95 text-white border-t border-white/10">
      {/* Mobile Player */}
      <div className="md:hidden p-3">
        <div className="flex items-center gap-3">
          <img
            src={currentSong.cover_url}
            alt={currentSong.title}
            className="w-12 h-12 rounded"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{currentSong.title}</h3>
            <p className="text-sm text-gray-400 truncate">{currentSong.artist}</p>
          </div>
          <button
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
        <div className="mt-2">
          <input
            type="range"
            min="0"
            max={duration}
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Desktop Player */}
      <div className="hidden md:block p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={currentSong.cover_url}
              alt={currentSong.title}
              className="w-16 h-16 rounded-lg"
            />
            <div>
              <h3 className="font-semibold">{currentSong.title}</h3>
              <p className="text-sm text-gray-400">{currentSong.artist}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="flex items-center gap-6">
              <button className="hover:text-purple-500">
                <SkipBack size={24} />
              </button>
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-700"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button className="hover:text-purple-500">
                <SkipForward size={24} />
              </button>
            </div>

            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-gray-400">
                {formatTime(progress)}
              </span>
              <input
                type="range"
                min="0"
                max={duration}
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="text-xs text-gray-400">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 size={20} />
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="100"
              className="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600"
              onChange={(e) => {
                if (audioRef.current) {
                  audioRef.current.volume = Number(e.target.value) / 100;
                }
              }}
            />
          </div>
        </div>
      </div>
      <audio ref={audioRef} />
    </div>
  );
};