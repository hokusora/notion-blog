import { useState } from "react";
import { useAudioPlaylist } from "../context/useAudioPlaylist";

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function AudioPlaylistCard() {
  const {
    queue,
    currentIndex,
    currentTrack,
    isPlaying,
    isLoopingCurrent,
    currentTime,
    duration,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    toggleLoop,
    seekTo,
    removeFromQueue,
    reorderQueue,
    renameTrack,
    clearQueue,
  } = useAudioPlaylist();

  // Drag and drop index state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // In-place rename state
  const [editingUrl, setEditingUrl] = useState(null);
  const [editTitleInput, setEditTitleInput] = useState("");

  const handleStartRename = (track) => {
    setEditingUrl(track.url);
    setEditTitleInput(track.title || "Audio Track");
  };

  const handleSaveRename = (url) => {
    if (editTitleInput.trim()) {
      renameTrack(url, editTitleInput.trim());
    }
    setEditingUrl(null);
  };

  // Drag-and-drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderQueue(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="audio-playlist-card w-full rounded-2xl border border-current/20 bg-cream/80 dark:bg-black/60 backdrop-blur-md p-4 sm:p-5 shadow-card transition-all text-inherit mt-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-current/20">
        <div className="flex items-center gap-2">
          <span className="text-base select-none">🎧</span>
          <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-inherit">
            Audio Playlist
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <>
              <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full border border-current/30 text-inherit bg-current/5">
                {queue.length} {queue.length === 1 ? "track" : "tracks"}
              </span>
              <button
                type="button"
                onClick={clearQueue}
                title="Clear playlist"
                className="text-[11px] opacity-60 hover:opacity-100 transition-opacity p-1 text-inherit hover:scale-105"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Empty State ── */}
      {queue.length === 0 ? (
        <div className="py-6 px-3 text-center rounded-xl border border-dashed border-current/20 bg-current/5 flex flex-col items-center justify-center gap-2">
          <span className="text-xl opacity-60">🎵</span>
          <p className="text-xs text-inherit font-medium">Your playlist is empty</p>
          <p className="text-[11px] text-inherit opacity-70 max-w-[210px] leading-relaxed">
            Click the circular <span className="font-bold border border-current rounded-full px-1.5 py-0.2 mx-0.5">+</span> button next to any audio file in the post to add it to the stream.
          </p>
        </div>
      ) : (
        <>
          {/* ── Now Playing Card Section ── */}
          {currentTrack && (
            <div className="mb-4 p-3 rounded-xl bg-current/5 border border-current/15 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm shrink-0">
                    {isPlaying ? "▶" : "⏸"}
                  </span>
                  {editingUrl === currentTrack.url ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="text"
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(currentTrack.url);
                          if (e.key === "Escape") setEditingUrl(null);
                        }}
                        autoFocus
                        className="w-full text-xs font-semibold px-1.5 py-0.5 rounded border border-current bg-transparent text-inherit outline-none font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(currentTrack.url)}
                        className="text-[11px] px-1.5 py-0.5 rounded border border-current text-inherit hover:bg-current/10 font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0 group/title">
                      <span className="font-semibold text-xs sm:text-sm text-inherit truncate">
                        {currentTrack.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartRename(currentTrack)}
                        title="Rename track"
                        className="opacity-40 group-hover/title:opacity-100 hover:scale-110 transition-all text-xs"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </div>

                {isLoopingCurrent && (
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded-md border border-current bg-current/10 text-inherit shrink-0 font-bold"
                    title="Infinite loop active on this track"
                  >
                    🔂 Loop 1
                  </span>
                )}
              </div>

              {/* Progress Slider & Timestamps */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-current bg-current/20"
                />
                <div className="flex justify-between text-[10px] font-mono opacity-70">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls Row: Prev, Play/Pause, Next, Loop */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={prevTrack}
                    disabled={queue.length <= 1}
                    className="p-1.5 rounded-full hover:bg-current/10 disabled:opacity-30 transition-colors text-inherit cursor-pointer"
                    title="Previous track"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full border border-current text-inherit bg-current/10 hover:bg-current/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 fill-current translate-x-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={nextTrack}
                    disabled={queue.length <= 1}
                    className="p-1.5 rounded-full hover:bg-current/10 disabled:opacity-30 transition-colors text-inherit cursor-pointer"
                    title="Next track"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>
                </div>

                {/* Loop 1 Infinitely Button */}
                <button
                  type="button"
                  onClick={toggleLoop}
                  className={`p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1 cursor-pointer ${
                    isLoopingCurrent
                      ? "border-current bg-current/20 font-bold shadow-xs scale-105"
                      : "border-transparent opacity-60 hover:opacity-100 hover:bg-current/5"
                  }`}
                  title={
                    isLoopingCurrent
                      ? "Infinite single-track loop ON (click to disable)"
                      : "Infinite single-track loop OFF (click to enable)"
                  }
                >
                  <span className="text-sm">🔂</span>
                  <span className="text-[10px] hidden sm:inline">Loop 1</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Drag & Drop Reorderable Queue ── */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] opacity-70 font-medium px-1 pb-1">
              <span>Queue (Drag ⠿ to reorder)</span>
              <span>{queue.length} songs</span>
            </div>

            <div className="max-h-56 overflow-y-auto pr-1 space-y-1 custom-lightbox-scrollbar">
              {queue.map((item, idx) => {
                const isCurrent = idx === currentIndex;
                const isBeingDragged = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx;

                return (
                  <div
                    key={item.id || item.url}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`group/item flex items-center justify-between gap-2 p-2 rounded-xl transition-all cursor-move select-none ${
                      isCurrent
                        ? "bg-current/15 font-semibold border border-current/30 shadow-xs"
                        : "hover:bg-current/5 border border-transparent"
                    } ${isBeingDragged ? "opacity-30 scale-95" : "opacity-100"} ${
                      isDragOver ? "border-dashed border-current bg-current/10" : ""
                    }`}
                  >
                    {/* Left: Drag handle + Index + Title */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className="text-xs opacity-40 group-hover/item:opacity-90 transition-opacity cursor-grab"
                        title="Drag to reorder"
                      >
                        ⠿
                      </span>

                      <button
                        type="button"
                        onClick={() => playTrack(idx)}
                        className="text-[11px] font-mono opacity-60 hover:opacity-100 text-inherit shrink-0 text-left"
                        title="Play this track"
                      >
                        {isCurrent && isPlaying ? (
                          <span className="animate-pulse">▶</span>
                        ) : (
                          `${idx + 1}.`
                        )}
                      </button>

                      {editingUrl === item.url ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            value={editTitleInput}
                            onChange={(e) => setEditTitleInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(item.url);
                              if (e.key === "Escape") setEditingUrl(null);
                            }}
                            autoFocus
                            className="w-full text-xs font-semibold px-1 py-0.5 rounded border border-current bg-transparent text-inherit outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(item.url)}
                            className="text-[10px] px-1 rounded border border-current text-inherit font-bold"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => playTrack(idx)}
                          className="text-xs text-inherit truncate cursor-pointer flex-1"
                          title={item.title}
                        >
                          {item.title}
                        </span>
                      )}
                    </div>

                    {/* Right: Actions (Rename + Remove) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartRename(item)}
                        className="opacity-0 group-hover/item:opacity-70 hover:opacity-100 text-[11px] p-1 transition-opacity text-inherit"
                        title="Rename track"
                      >
                        ✏️
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromQueue(idx)}
                        className="opacity-40 group-hover/item:opacity-100 hover:text-red-500 text-xs p-1 transition-opacity text-inherit"
                        title="Remove from queue"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
