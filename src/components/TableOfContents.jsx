import { useEffect, useState, useMemo } from "react";
import { parseHeadings } from "../utils/slugify";

/**
 * TableOfContents Component
 * Automatically populates from h2 and h3 headers in the article,
 * supports smooth section jumping with header offset compensation,
 * and highlights active headings during scroll.
 */
export default function TableOfContents({ content, blocks, variant = "desktop" }) {
  const headings = useMemo(() => parseHeadings(content, blocks), [content, blocks]);
  const [activeId, setActiveId] = useState("");
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Scroll spy to highlight active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      // Offset considering sticky header (64px) + margin
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

  if (headings.length === 0) {
    return null;
  }

  // Mobile Collapsible Variant
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
              Table of Contents
            </span>
            <span className="text-[10px] font-semibold text-mint-700 bg-mint-100 px-2 py-0.5 rounded-full">
              {headings.length}
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
          <nav className="mt-3 pt-3 border-t border-ink-300/30 space-y-1.5 max-h-64 overflow-y-auto">
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
    );
  }

  // Desktop Sticky Sidebar Variant
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
        <span className="text-[10px] font-semibold text-mint-700 bg-mint-100 px-2 py-0.5 rounded-full">
          {headings.length}
        </span>
      </div>

      {/* Headings List */}
      <div className="space-y-0.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
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
