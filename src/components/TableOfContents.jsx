import { useEffect, useState, useMemo } from "react";
import { parseHeadings } from "../utils/slugify";
import { extractPageContentMedia, formatBytes } from "../utils/mediaScanner";

// Fallback byte estimation when CORS/external server blocks HEAD/Range requests
const FALLBACK_ESTIMATES = {
  image: 650 * 1024, // ~650 KB per high-res image
  video: 5 * 1024 * 1024, // ~5 MB per video
  audio: 2.5 * 1024 * 1024, // ~2.5 MB per audio track
};

/**
 * MediaPayloadWidget:
 * Displays total file size and itemized breakdown of images, videos, and audios
 * uploaded strictly within the current page's content body.
 */
function MediaPayloadWidget({ media, loading, sizeData }) {
  const { items, images, videos, audios, totalCount } = media;

  // Calculate totals per category
  const { totalBytes, imageBytes, videoBytes, audioBytes } = useMemo(() => {
    let imgB = 0;
    let vidB = 0;
    let audB = 0;

    for (const item of items) {
      let b = sizeData[item.url];
      // If server returned 0 or error, use fallback estimate
      if (!b || b <= 0) {
        b = FALLBACK_ESTIMATES[item.type] || 0;
      }

      if (item.type === "image") imgB += b;
      else if (item.type === "video") vidB += b;
      else if (item.type === "audio") audB += b;
    }

    return {
      totalBytes: imgB + vidB + audB,
      imageBytes: imgB,
      videoBytes: vidB,
      audioBytes: audB,
    };
  }, [items, sizeData]);

  if (totalCount === 0) {
    return (
      <div className="mb-4 p-3 rounded-xl bg-ink-100/50 border border-ink-200/40 text-xs text-ink-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <span>📄</span>
          <span>Text Only Page</span>
        </span>
        <span className="font-mono text-[11px] text-ink-400">0 B media</span>
      </div>
    );
  }

  return (
    <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-br from-mint-50/70 via-pink-50/30 to-cream border border-mint-200/60 shadow-xs">
      {/* Total size row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">💾</span>
          <span className="text-xs font-bold uppercase tracking-wider text-ink-800">
            Media Payload
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {loading ? (
            <span className="text-xs font-mono text-ink-400 animate-pulse">
              Calculating...
            </span>
          ) : (
            <span className="font-mono font-bold text-xs sm:text-sm text-mint-700 bg-white/80 px-2 py-0.5 rounded-md shadow-xs border border-mint-200/50">
              {formatBytes(totalBytes)}
            </span>
          )}
        </div>
      </div>

      {/* Itemized breakdown chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-ink-200/40 text-[11px]">
        {images.length > 0 && (
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/60 border border-ink-100/70">
            <span className="text-ink-600 flex items-center gap-1 truncate">
              <span>🖼️</span>
              <span>{images.length} {images.length === 1 ? "image" : "images"}</span>
            </span>
            <span className="font-mono font-medium text-ink-800 shrink-0 ml-1">
              {formatBytes(imageBytes)}
            </span>
          </div>
        )}

        {videos.length > 0 && (
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/60 border border-ink-100/70">
            <span className="text-ink-600 flex items-center gap-1 truncate">
              <span>🎬</span>
              <span>{videos.length} {videos.length === 1 ? "video" : "videos"}</span>
            </span>
            <span className="font-mono font-medium text-ink-800 shrink-0 ml-1">
              {formatBytes(videoBytes)}
            </span>
          </div>
        )}

        {audios.length > 0 && (
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/60 border border-ink-100/70">
            <span className="text-ink-600 flex items-center gap-1 truncate">
              <span>🎵</span>
              <span>{audios.length} {audios.length === 1 ? "audio" : "audios"}</span>
            </span>
            <span className="font-mono font-medium text-ink-800 shrink-0 ml-1">
              {formatBytes(audioBytes)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * TableOfContents Component
 * - Automatically populates from h2 and h3 headers in the article
 * - Calculates and displays total media upload payload (images, video, audio)
 * - Highlights active headings during scroll and provides smooth navigation
 */
export default function TableOfContents({ content, blocks, variant = "desktop" }) {
  const headings = useMemo(() => parseHeadings(content, blocks), [content, blocks]);
  const [activeId, setActiveId] = useState("");
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Extract media items strictly from current page content (excluding cover & sub-pages)
  const media = useMemo(() => extractPageContentMedia(blocks, content), [blocks, content]);

  // Size calculation state
  const [sizeData, setSizeData] = useState({});
  const [loadingSizes, setLoadingSizes] = useState(false);

  // Probe media sizes via server API
  useEffect(() => {
    if (!media.urls || media.urls.length === 0) return;

    let isMounted = true;
    const controller = new AbortController();

    Promise.resolve().then(async () => {
      if (!isMounted) return;
      setLoadingSizes(true);
      try {
        const res = await fetch("/api/media-sizes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: media.urls }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to probe media sizes");
        const data = await res.json();
        if (isMounted && data?.sizes) {
          setSizeData(data.sizes);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Could not probe media sizes:", err.message);
        }
      } finally {
        if (isMounted) {
          setLoadingSizes(false);
        }
      }
    });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [media.urls]);

  // Scroll spy to highlight active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const detectionOffset = 110;
      let currentActive = "";

      for (let i = 0; i < headings.length; i++) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + scrollY;
          if (scrollY + detectionOffset >= top) {
            currentActive = headings[i].id;
          }
        }
      }

      if (!currentActive && headings.length > 0) {
        currentActive = headings[0].id;
      }

      setActiveId(currentActive);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [headings]);

  const handleJump = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      try {
        window.history.pushState(null, "", `#${id}`);
      } catch {
        // Safe fallback in restricted environments
      }
      setActiveId(id);
      if (variant === "mobile") {
        setIsOpenMobile(false);
      }
    }
  };

  const handleBackToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If article has neither headings NOR media, hide TOC container
  if (headings.length === 0 && media.totalCount === 0) {
    return null;
  }

  // ── Mobile Collapsible Variant ──
  if (variant === "mobile") {
    return (
      <div className="rounded-2xl border border-ink-300/40 bg-cream/70 backdrop-blur-md p-4 shadow-sm my-6 transition-all">
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="w-full flex items-center justify-between text-left focus:outline-none"
          aria-expanded={isOpenMobile}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse" />
            <span className="font-serif text-sm font-bold text-ink-900 tracking-tight">
              Table of Contents & Payload
            </span>
            <span className="text-[10px] font-semibold text-mint-700 bg-mint-100 px-2 py-0.5 rounded-full">
              {headings.length > 0 ? `${headings.length} sections` : `${media.totalCount} media`}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-ink-500 transition-transform duration-200 ${
              isOpenMobile ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpenMobile && (
          <div className="mt-3 pt-3 border-t border-ink-300/30">
            {/* Embedded Media Payload Widget */}
            <MediaPayloadWidget
              media={media}
              loading={loadingSizes}
              sizeData={sizeData}
            />

            {/* Headings List if present */}
            {headings.length > 0 && (
              <nav className="space-y-1.5 max-h-64 overflow-y-auto pt-1">
                {headings.map(({ id, text, level }) => {
                  const isActive = activeId === id;
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={(e) => handleJump(e, id)}
                      className={`block py-1.5 transition-colors rounded-lg ${
                        level === 3 ? "pl-5 text-xs" : "pl-2 text-sm"
                      } ${
                        isActive
                          ? "text-mint-700 font-semibold bg-mint-100/60"
                          : "text-ink-600 hover:text-ink-900 hover:bg-ink-100/50"
                      }`}
                    >
                      <span className="line-clamp-1">{text}</span>
                    </a>
                  );
                })}
              </nav>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Desktop Sticky Sidebar Variant ──
  return (
    <nav
      aria-label="Table of contents"
      className="w-full rounded-2xl border border-ink-300/40 bg-cream/75 backdrop-blur-md p-5 shadow-card transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-ink-300/30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-mint-500" />
          <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-ink-900">
            Table of Contents
          </h4>
        </div>
        {headings.length > 0 && (
          <span className="text-[10px] font-semibold text-mint-700 bg-mint-100 px-2 py-0.5 rounded-full">
            {headings.length}
          </span>
        )}
      </div>

      {/* Embedded Media Payload Widget */}
      <MediaPayloadWidget
        media={media}
        loading={loadingSizes}
        sizeData={sizeData}
      />

      {/* Headings List */}
      {headings.length > 0 ? (
        <div className="space-y-0.5 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
          {headings.map(({ id, text, level }) => {
            const isActive = activeId === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => handleJump(e, id)}
                className={`group flex items-center py-1.5 transition-all text-left ${
                  level === 3 ? "pl-5 text-xs" : "pl-3 text-[13px]"
                } ${
                  isActive
                    ? "text-mint-700 font-semibold border-l-2 border-mint-500 bg-mint-50/70 rounded-r-md"
                    : "text-ink-600 hover:text-ink-900 border-l-2 border-transparent hover:border-ink-300"
                }`}
              >
                <span className="line-clamp-2 leading-snug">{text}</span>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="py-2 text-xs text-ink-400 italic">
          No section headings in this post.
        </div>
      )}

      {/* Back to top footer */}
      <div className="mt-4 pt-3 border-t border-ink-300/30 flex items-center justify-between text-xs text-ink-500">
        <button
          type="button"
          onClick={handleBackToTop}
          className="inline-flex items-center gap-1.5 hover:text-mint-600 transition-colors font-medium cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Back to top
        </button>
      </div>
    </nav>
  );
}
