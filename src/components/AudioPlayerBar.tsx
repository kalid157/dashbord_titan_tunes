import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Shuffle,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  ListMusic,
} from 'lucide-react';
import { Song } from '../types';

export type RepeatMode = 'off' | 'all' | 'one';

interface AudioPlayerBarProps {
  currentSong: Song | null;
  songs?: Song[];
  onSelectSong: (song: Song) => void;
  onClose: () => void;
  initialShuffle?: boolean;
  initialRepeatMode?: RepeatMode;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentSong,
  songs = [],
  onSelectSong,
  onClose,
  initialShuffle = false,
  initialRepeatMode = 'all',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);

  // Playback modes requested by user:
  // 1. Enchaînement automatique (Continuous play)
  // 2. Lecture aléatoire (Shuffle)
  // 3. Boucle une fois (Repeat One) ou Répéter tout (Repeat All)
  const [isShuffle, setIsShuffle] = useState(initialShuffle);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(initialRepeatMode);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);

  // Maintain active queue
  const queue = songs.length > 0 ? songs : (currentSong ? [currentSong] : []);

  const currentIndex = currentSong
    ? queue.findIndex(
        (s) =>
          (s.trackingIdSong && s.trackingIdSong === currentSong.trackingIdSong) ||
          (s.trackingId && s.trackingId === currentSong.trackingId) ||
          (s.titre === currentSong.titre && s.audio === currentSong.audio)
      )
    : -1;

  // Next Track logic
  const getNextSong = useCallback((): Song | null => {
    if (queue.length === 0) return null;
    if (queue.length === 1) return queue[0];

    if (isShuffle) {
      // Pick random song different from current if possible
      const availableIndices = queue
        .map((_, i) => i)
        .filter((i) => i !== currentIndex);
      const randIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      return queue[randIdx !== undefined ? randIdx : 0];
    } else {
      const nextIdx = currentIndex + 1;
      if (nextIdx < queue.length) {
        return queue[nextIdx];
      } else if (repeatMode === 'all') {
        return queue[0];
      }
      return null;
    }
  }, [queue, currentIndex, isShuffle, repeatMode]);

  // Previous Track logic
  const getPreviousSong = useCallback((): Song | null => {
    if (queue.length === 0) return null;
    if (queue.length === 1) return queue[0];

    const prevIdx = currentIndex - 1;
    if (prevIdx >= 0) {
      return queue[prevIdx];
    } else {
      return queue[queue.length - 1];
    }
  }, [queue, currentIndex]);

  const handleNext = useCallback(() => {
    const nextSong = getNextSong();
    if (nextSong) {
      onSelectSong(nextSong);
    } else {
      setIsPlaying(false);
    }
  }, [getNextSong, onSelectSong]);

  const handlePrevious = useCallback(() => {
    // If more than 3 seconds in, restart track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const prevSong = getPreviousSong();
    if (prevSong) {
      onSelectSong(prevSong);
    }
  }, [getPreviousSong, onSelectSong]);

  // Auto-play when currentSong changes
  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.audio;
      audioRef.current.load();
      audioRef.current.volume = volume;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [currentSong]);

  // Listen to track completion -> Auto-advance, repeat 1, or shuffle
  const handleSongEnded = () => {
    if (repeatMode === 'one') {
      // "Boucle une fois" - rejoue la piste
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => setIsPlaying(true));
      }
      return;
    }

    // Auto-advance to next track
    const nextSong = getNextSong();
    if (nextSong) {
      onSelectSong(nextSong);
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const cycleRepeatMode = () => {
    if (repeatMode === 'off') {
      setRepeatMode('all');
    } else if (repeatMode === 'all') {
      setRepeatMode('one');
    } else {
      setRepeatMode('off');
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentSong) return null;

  const nextUpcomingSong = getNextSong();

  return (
    <>
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[96%] max-w-2xl bg-gray-950/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl p-3 sm:p-3.5 z-50 border border-gray-800/80 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleSongEnded}
          onError={() => {
            setIsPlaying(false);
          }}
        />

        {/* Top Info Bar on Mobile / Progress scrub */}
        <div className="flex flex-col gap-2">
          {/* Main Row: Info + Controls + Aux */}
          <div className="flex items-center justify-between gap-3">
            {/* Left: Song details */}
            <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-xs">
              <img
                src={currentSong.imageAlbum}
                alt={currentSong.titre}
                className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80';
                }}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm truncate text-white">
                    {currentSong.titre}
                  </h4>
                  {currentIndex >= 0 && queue.length > 1 && (
                    <span className="text-[10px] text-gray-400 font-mono shrink-0 hidden sm:inline">
                      ({currentIndex + 1}/{queue.length})
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-[#FF8A00] truncate font-medium">
                  {currentSong.artiste || 'Artiste'}
                </p>
                {nextUpcomingSong && repeatMode !== 'one' && (
                  <p className="text-[10px] text-gray-400 truncate hidden md:block">
                    Suivant : {nextUpcomingSong.titre}
                  </p>
                )}
              </div>
            </div>

            {/* Center: Playback Controls (Shuffle, Previous, Play/Pause, Next, Repeat) */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Shuffle Button (Lecture Aléatoire) */}
              <button
                type="button"
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-xl transition cursor-pointer relative ${
                  isShuffle
                    ? 'text-[#FF8A00] bg-orange-500/15 shadow-xs'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={
                  isShuffle
                    ? 'Lecture aléatoire : Activée'
                    : 'Activer la lecture aléatoire (Shuffle)'
                }
              >
                <Shuffle size={17} />
                {isShuffle && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FF8A00] rounded-full" />
                )}
              </button>

              {/* Previous Button */}
              <button
                type="button"
                onClick={handlePrevious}
                disabled={queue.length <= 1}
                className="p-2 text-gray-300 hover:text-white transition disabled:opacity-40 cursor-pointer hover:bg-white/5 rounded-xl"
                title="Morceau précédent"
              >
                <SkipBack size={19} />
              </button>

              {/* Play / Pause Primary Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-[#FF8A00] to-amber-500 hover:from-[#e67c00] hover:to-amber-600 text-white flex items-center justify-center transition active:scale-95 shadow-lg shadow-orange-500/30 cursor-pointer shrink-0"
                title={isPlaying ? 'Mettre en pause' : 'Lire le morceau'}
              >
                {isPlaying ? (
                  <Pause size={19} fill="white" />
                ) : (
                  <Play size={19} fill="white" className="ml-0.5" />
                )}
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                disabled={queue.length <= 1}
                className="p-2 text-gray-300 hover:text-white transition disabled:opacity-40 cursor-pointer hover:bg-white/5 rounded-xl"
                title="Morceau suivant (enchaînement)"
              >
                <SkipForward size={19} />
              </button>

              {/* Repeat Button (Boucle une fois / Répéter tout / Désactivé) */}
              <button
                type="button"
                onClick={cycleRepeatMode}
                className={`p-2 rounded-xl transition cursor-pointer relative ${
                  repeatMode === 'one'
                    ? 'text-emerald-400 bg-emerald-500/15'
                    : repeatMode === 'all'
                    ? 'text-[#00BFA6] bg-teal-500/15'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={
                  repeatMode === 'one'
                    ? 'Boucle une fois (ce morceau sera répété)'
                    : repeatMode === 'all'
                    ? 'Répéter toute la liste (en boucle)'
                    : 'Répétition désactivée'
                }
              >
                {repeatMode === 'one' ? (
                  <Repeat1 size={17} />
                ) : (
                  <Repeat size={17} />
                )}
                {repeatMode !== 'off' && (
                  <span
                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                      repeatMode === 'one' ? 'bg-emerald-400' : 'bg-[#00BFA6]'
                    }`}
                  />
                )}
              </button>
            </div>

            {/* Right: Volume & Queue & Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Queue drawer toggle button */}
              {queue.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowQueueDrawer(!showQueueDrawer)}
                  className={`p-2 rounded-xl transition cursor-pointer hidden sm:flex items-center gap-1 ${
                    showQueueDrawer
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Voir la file d'attente"
                >
                  <ListMusic size={17} />
                </button>
              )}

              {/* Volume */}
              <div className="hidden md:flex items-center gap-1.5 px-1">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 text-gray-400 hover:text-white transition cursor-pointer"
                  title={isMuted ? 'Rétablir le son' : 'Couper le son'}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#FF8A00]"
                  title={`Volume : ${Math.round(volume * 100)}%`}
                />
              </div>

              {/* Close Player */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Fermer le lecteur"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Progress Slider & Timers */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[10px] text-gray-400 font-mono w-8 text-right shrink-0">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 group">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FF8A00] transition"
              />
            </div>
            <span className="text-[10px] text-gray-400 font-mono w-8 shrink-0">
              {formatTime(duration)}
            </span>
          </div>

          {/* Indicators status banner */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 border-t border-gray-900 pt-1">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Enchaînement automatique actif</span>
            </span>

            <div className="flex items-center gap-3">
              {isShuffle && (
                <span className="text-[#FF8A00] font-medium flex items-center gap-1">
                  <Shuffle size={10} /> Aléatoire
                </span>
              )}
              {repeatMode === 'one' && (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Repeat1 size={10} /> Boucle 1 fois
                </span>
              )}
              {repeatMode === 'all' && (
                <span className="text-[#00BFA6] font-medium flex items-center gap-1">
                  <Repeat size={10} /> Répéter la liste
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Queue Drawer */}
      {showQueueDrawer && queue.length > 0 && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[96%] max-w-md bg-gray-900/98 backdrop-blur-2xl text-white rounded-2xl shadow-2xl p-4 z-50 border border-gray-700 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <ListMusic size={16} className="text-[#FF8A00]" />
              <h3 className="font-bold text-xs">File de lecture ({queue.length} morceaux)</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowQueueDrawer(false)}
              className="text-gray-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1.5 pt-2 pr-1">
            {queue.map((s, idx) => {
              const isSelected =
                (s.trackingIdSong && s.trackingIdSong === currentSong.trackingIdSong) ||
                (s.titre === currentSong.titre && s.audio === currentSong.audio);

              return (
                <button
                  key={s.trackingIdSong || s.trackingId || idx}
                  type="button"
                  onClick={() => {
                    onSelectSong(s);
                    setShowQueueDrawer(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <span className="text-[10px] font-mono w-4 text-center text-gray-500">
                    {idx + 1}
                  </span>
                  <img
                    src={s.imageAlbum}
                    alt={s.titre}
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{s.titre}</p>
                    <p className="text-[10px] text-gray-400 truncate">{s.artiste}</p>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] bg-[#FF8A00] text-white px-2 py-0.5 rounded-full font-bold">
                      En cours
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
