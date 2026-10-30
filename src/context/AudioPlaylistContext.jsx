import { useState, useEffect, useRef, useCallback } from "react";
import { AudioPlaylistContext } from "./audioPlaylistContextDef";

const STORAGE_KEY_QUEUE = "notion_audio_queue";
const STORAGE_KEY_TITLES = "notion_audio_custom_titles";
const STORAGE_KEY_LOOP = "notion_audio_is_looping";

export function AudioPlaylistProvider({ children }) {
  // Custom track names saved permanently in localStorage
  const [customTitles, setCustomTitles] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TITLES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Playlist queue items: [ { id, url, title, duration } ]
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUEUE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoopingCurrent, setIsLoopingCurrent] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_LOOP) === "true";
    } catch {
      return false;
    }
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Hidden persistent HTML5 Audio element
  const audioRef = useRef(null);

  // Sync queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [queue]);

  // Sync custom titles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TITLES, JSON.stringify(customTitles));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [customTitles]);

  // Sync loop preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOOP, String(isLoopingCurrent));
    } catch {
      // Storage unavailable
    }
  }, [isLoopingCurrent]);

  // Helper to resolve title with custom overrides
  const getTrackTitle = useCallback(
    (url, defaultTitle = "Audio Track") => {
      if (!url) return defaultTitle;
      if (customTitles[url] && customTitles[url].trim().length > 0) {
        return customTitles[url].trim();
      }
      return defaultTitle;
    },
    [customTitles]
  );

  const currentTrack = queue[currentIndex] || null;

  // Initialize and handle audio events
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (isLoopingCurrent) {
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
      } else {
        // Advance to next track or stop at end of queue
        setQueue((prevQueue) => {
          if (prevQueue.length === 0) {
            setIsPlaying(false);
            return prevQueue;
          }
          setCurrentIndex((prevIdx) => {
            if (prevIdx < prevQueue.length - 1) {
              return prevIdx + 1;
            } else {
              // End of playlist reached
              setIsPlaying(false);
              return 0;
            }
          });
          return prevQueue;
        });
      }
    };

    const handleError = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [isLoopingCurrent]);

  // Sync audio src when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack && currentTrack.url) {
      if (audio.src !== currentTrack.url) {
        audio.src = currentTrack.url;
        audio.currentTime = 0;
        if (isPlaying) {
          audio.play().catch(() => setIsPlaying(false));
        }
      }
    } else {
      audio.pause();
      audio.removeAttribute("src");
    }
  }, [currentTrack, isPlaying]);

  // Rename a track persistently in localStorage and in current queue
  const renameTrack = useCallback((url, newTitle) => {
    if (!url || !newTitle) return;
    const cleanTitle = newTitle.trim();
    if (!cleanTitle) return;

    setCustomTitles((prev) => ({
      ...prev,
      [url]: cleanTitle,
    }));

    setQueue((prev) =>
      prev.map((item) => (item.url === url ? { ...item, title: cleanTitle } : item))
    );
  }, []);

  // Add track to queue
  const addToQueue = useCallback(
    (track) => {
      if (!track || !track.url) return;
      const resolvedTitle = getTrackTitle(track.url, track.title || "Audio Track");
      const newItem = {
        id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        url: track.url,
        title: resolvedTitle,
      };

      setQueue((prev) => {
        // If track is already in queue, don't duplicate
        const exists = prev.some((item) => item.url === track.url);
        if (exists) return prev;
        return [...prev, newItem];
      });

      return true;
    },
    [getTrackTitle]
  );

  // Remove track from queue
  const removeFromQueue = useCallback(
    (index) => {
      setQueue((prev) => {
        const next = prev.filter((_, idx) => idx !== index);
        if (index === currentIndex) {
          if (next.length === 0) {
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
          } else if (index >= next.length) {
            setCurrentIndex(next.length - 1);
          }
        } else if (index < currentIndex) {
          setCurrentIndex((c) => Math.max(0, c - 1));
        }
        return next;
      });
    },
    [currentIndex]
  );

  // Reorder queue via drag-and-drop
  const reorderQueue = useCallback(
    (fromIndex, toIndex) => {
      if (fromIndex === toIndex) return;
      setQueue((prev) => {
        const result = Array.from(prev);
        const [removed] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, removed);

        // Adjust currentIndex to track the same currently playing song
        if (currentIndex === fromIndex) {
          setCurrentIndex(toIndex);
        } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
          setCurrentIndex((c) => c - 1);
        } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
          setCurrentIndex((c) => c + 1);
        }

        return result;
      });
    },
    [currentIndex]
  );

  // Play specific track by index
  const playTrack = useCallback((index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (queue.length === 0) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isPlaying, queue.length]);

  // Next track
  const nextTrack = useCallback(() => {
    if (queue.length <= 1) return;
    setCurrentIndex((prev) => (prev < queue.length - 1 ? prev + 1 : 0));
    setIsPlaying(true);
  }, [queue.length]);

  // Previous track
  const prevTrack = useCallback(() => {
    if (queue.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : queue.length - 1));
    setIsPlaying(true);
  }, [queue.length]);

  // Toggle infinite single track loop
  const toggleLoop = useCallback(() => {
    setIsLoopingCurrent((prev) => !prev);
  }, []);

  // Seek playback position
  const seekTo = useCallback((seconds) => {
    if (audioRef.current && !isNaN(seconds)) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
    }
    setQueue([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return (
    <AudioPlaylistContext.Provider
      value={{
        queue,
        currentIndex,
        currentTrack,
        isPlaying,
        isLoopingCurrent,
        currentTime,
        duration,
        customTitles,
        getTrackTitle,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        toggleLoop,
        seekTo,
        renameTrack,
        clearQueue,
      }}
    >
      {children}
    </AudioPlaylistContext.Provider>
  );
}
