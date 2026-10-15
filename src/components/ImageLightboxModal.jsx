import { useState, useEffect, useRef, useCallback } from "react";

function LightboxViewer({ images, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showDrawer, setShowDrawer] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const thumbnailRefs = useRef([]);
  const touchStartRef = useRef({ x: 0, y: 0 });

  // Lock body scroll while lightbox is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, [images]);

  const handleNext = useCallback(() => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, [images]);

  // Slideshow autoplay cycle (3.5s per image)
  useEffect(() => {
    let interval = null;
    if (isPlaying && images.length > 1) {
      interval = setInterval(() => {
        handleNext();
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, images.length, handleNext]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (showDrawer && thumbnailRefs.current[currentIndex]) {
      thumbnailRefs.current[currentIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [currentIndex, showDrawer]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === "+" || e.key === "=") {
        setZoomLevel((z) => Math.min(z + 0.5, 3));
      } else if (e.key === "-") {
        setZoomLevel((z) => {
          const next = Math.max(z - 0.5, 1);
          if (next === 1) setPan({ x: 0, y: 0 });
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // Fullscreen toggle helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Zoom toggle helper
  const toggleZoom = () => {
    setZoomLevel((prev) => {
      if (prev === 1) return 2;
      setPan({ x: 0, y: 0 });
      return 1;
    });
  };

  // Pan / Drag handlers when zoomed
  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch swipe support
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e) => {
    if (zoomLevel > 1) return;
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
        if (deltaX > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    }
  };

  const currentImage = images[currentIndex] || {};
  const imageSrc = currentImage.src || currentImage.url || "";
  const imageAlt = currentImage.alt || currentImage.caption || `Image ${currentIndex + 1}`;
  const caption = currentImage.caption || currentImage.title || "";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black/95 text-white flex flex-col select-none overflow-hidden animate-in fade-in duration-200"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* ── Top Header Toolbar ── */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent shrink-0">
        {/* Left: Counter (e.g. 9 / 95) */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm sm:text-base tracking-wider text-neutral-300 font-semibold bg-white/10 px-3 py-1 rounded-md backdrop-blur-sm">
            <span className="text-white">{currentIndex + 1}</span>
            <span className="text-neutral-400 mx-1.5">/</span>
            <span>{images.length}</span>
          </span>

          {isPlaying && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Autoplay</span>
            </div>
          )}
        </div>

        {/* Right Action Icons: Zoom, Play/Pause, Grid Toggle, Fullscreen, Close */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom Toggle */}
          <button
            type="button"
            onClick={toggleZoom}
            className={`p-2 sm:p-2.5 rounded-lg transition-colors hover:bg-white/15 focus:outline-none ${
              zoomLevel > 1 ? "bg-white/25 text-white" : "text-neutral-300"
            }`}
            title={zoomLevel > 1 ? "Reset zoom (1x)" : "Zoom in (2x)"}
            aria-label="Zoom image"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  zoomLevel > 1
                    ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                    : "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                }
              />
            </svg>
          </button>

          {/* Autoplay / Slideshow Toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className={`p-2 sm:p-2.5 rounded-lg transition-colors hover:bg-white/15 focus:outline-none ${
              isPlaying ? "bg-pink-600/40 text-pink-300 ring-1 ring-pink-500/50" : "text-neutral-300"
            }`}
            title={isPlaying ? "Pause slideshow (Space)" : "Start autoplay slideshow (Space)"}
            aria-label="Toggle autoplay slideshow"
          >
            {isPlaying ? (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Grid / Thumbnail Drawer Toggle (3x3 grid icon like reference) */}
          <button
            type="button"
            onClick={() => setShowDrawer((prev) => !prev)}
            className={`p-2 sm:p-2.5 rounded-lg transition-colors hover:bg-white/15 focus:outline-none ${
              showDrawer ? "bg-white/25 text-white" : "text-neutral-300"
            }`}
            title={showDrawer ? "Hide thumbnail drawer" : "Show thumbnail drawer"}
            aria-label="Toggle thumbnail drawer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/15 transition-colors focus:outline-none hidden sm:inline-flex"
            title="Toggle fullscreen"
            aria-label="Toggle fullscreen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isFullscreen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 9L4 4m0 0l5 0m-5 0l0 5m11 5l5 5m0 0l-5 0m5 0l0-5m-5-11l5-5m0 0l-5 0m5 0l0 5M4 20l5-5m0 0l-5 0m5 0l0 5"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              )}
            </svg>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 ml-1 rounded-lg text-neutral-300 hover:text-white hover:bg-red-500/30 transition-colors focus:outline-none"
            title="Close gallery (Esc)"
            aria-label="Close gallery"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Autoplay animated countdown line */}
      {isPlaying && (
        <div className="w-full h-0.5 bg-neutral-800 shrink-0 overflow-hidden">
          <div
            key={currentIndex}
            className="h-full bg-pink-500 animate-[progress_3.5s_linear]"
            style={{
              animation: "progress 3.5s linear",
            }}
          />
        </div>
      )}

      {/* ── Main Body: Stage + Right Sidebar Drawer ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Display Stage */}
        <div
          className="flex-1 flex items-center justify-center relative p-2 sm:p-6 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={toggleZoom}
        >
          {/* Previous Arrow Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 focus:outline-none backdrop-blur-sm"
              title="Previous image (←)"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Active Image Canvas */}
          <div
            className={`max-w-full max-h-full flex items-center justify-center transition-transform duration-150 ${
              zoomLevel > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
            }`}
            onMouseDown={handleMouseDown}
            style={{
              transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px)`,
              transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <img
              key={imageSrc}
              src={imageSrc}
              alt={imageAlt}
              className="max-h-[82vh] sm:max-h-[86vh] max-w-[92vw] sm:max-w-full object-contain rounded-lg shadow-2xl pointer-events-none select-none transition-opacity duration-200"
              draggable={false}
            />
          </div>

          {/* Next Arrow Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 focus:outline-none backdrop-blur-sm"
              title="Next image (→)"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Bottom Caption Pill */}
          {caption && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-xl px-4 py-2 bg-black/75 backdrop-blur-md rounded-xl border border-white/10 text-xs sm:text-sm text-neutral-200 text-center line-clamp-2 shadow-lg">
              {caption}
            </div>
          )}
        </div>

        {/* ── Vertical Right Sidebar Drawer (Matching User Reference) ── */}
        {showDrawer && (
          <aside className="w-40 sm:w-56 md:w-64 shrink-0 bg-[#121212] border-l border-white/10 flex flex-col z-20 shadow-2xl transition-all duration-300 overflow-hidden">
            {/* Drawer Title Header */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between text-xs text-neutral-400 font-medium">
              <span className="flex items-center gap-1.5 font-semibold text-neutral-300">
                <span>Gallery List</span>
                <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">
                  {images.length}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="text-neutral-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors"
                title="Hide sidebar"
              >
                Hide ✕
              </button>
            </div>

            {/* 2-Column Vertical Thumbnail Grid with Red Active Border */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 custom-lightbox-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {images.map((img, idx) => {
                  const isActive = idx === currentIndex;
                  const thumbUrl = img.src || img.url || "";
                  const thumbAlt = img.alt || `Thumb ${idx + 1}`;

                  return (
                    <button
                      key={img.id || `${thumbUrl}-${idx}`}
                      ref={(el) => (thumbnailRefs.current[idx] = el)}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setZoomLevel(1);
                        setPan({ x: 0, y: 0 });
                      }}
                      className={`relative aspect-[3/4] rounded-md overflow-hidden transition-all duration-150 focus:outline-none group ${
                        isActive
                          ? "ring-2 ring-red-500 ring-offset-2 ring-offset-black scale-[0.98] shadow-md shadow-red-500/30"
                          : "opacity-60 hover:opacity-100 hover:scale-[1.02]"
                      }`}
                      title={`Go to image ${idx + 1}`}
                    >
                      <img
                        src={thumbUrl}
                        alt={thumbAlt}
                        loading="lazy"
                        className="w-full h-full object-cover select-none"
                      />
                      {/* Image Index Overlay */}
                      <span
                        className={`absolute top-1 left-1 text-[9px] font-mono px-1 rounded ${
                          isActive
                            ? "bg-red-600 text-white font-bold"
                            : "bg-black/60 text-neutral-300 group-hover:bg-black/80"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default function ImageLightboxModal({
  images = [],
  initialIndex = 0,
  isOpen = false,
  onClose,
}) {
  if (!isOpen || !images || images.length === 0) {
    return null;
  }

  return (
    <LightboxViewer
      key={`${isOpen}-${initialIndex}-${images.length}`}
      images={images}
      initialIndex={initialIndex}
      onClose={onClose}
    />
  );
}
