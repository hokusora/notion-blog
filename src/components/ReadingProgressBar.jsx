import { useEffect, useState } from "react";

/**
 * ReadingProgressBar
 * A thin, fixed-position progress bar at the top of the screen that updates
 * smoothly based on the user's scroll position within the article content,
 * indicating how much of the blog post remains.
 */
const ReadingProgressBar = ({ targetRef }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrameId = null;

    const calculateProgress = () => {
      const element = targetRef?.current || document.querySelector("article");
      if (!element) {
        setProgress(0);
        return;
      }

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollY =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        0;

      // Absolute top offset of article in document
      const elementTop = rect.top + scrollY;
      const elementHeight = element.offsetHeight || rect.height;

      // When the bottom of the article reaches the bottom of the viewport,
      // the reader has reached the end of the blog post.
      const articleBottom = elementTop + elementHeight;
      const totalScroll = articleBottom - windowHeight;
      const docHeight = document.documentElement.scrollHeight;

      // If at top of the page
      if (scrollY <= 2) {
        setProgress(0);
        return;
      }

      // If scrolled to absolute bottom of page or past article end
      if (scrollY + windowHeight >= docHeight - 5 || scrollY >= totalScroll) {
        setProgress(100);
        return;
      }

      if (totalScroll <= 0) {
        // Short article that fits entirely in the viewport
        setProgress(100);
        return;
      }

      // Current progress through the article
      const percentage = (scrollY / totalScroll) * 100;
      setProgress(Math.min(100, Math.max(0, percentage)));
    };

    const handleScrollOrResize = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(calculateProgress);
    };

    // Calculate immediately on mount
    calculateProgress();

    // Event listeners
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });
    window.addEventListener("load", handleScrollOrResize, { passive: true });

    // Handle dynamic size adjustments (e.g., images loading in markdown)
    let resizeObserver = null;
    const element = targetRef?.current || document.querySelector("article");
    if (element && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleScrollOrResize();
      });
      resizeObserver.observe(element);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("load", handleScrollOrResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [targetRef]);

  const rounded = Math.round(progress);
  const remaining = Math.max(0, 100 - rounded);

  return (
    <div
      className="fixed top-0 left-0 right-0 w-full h-[3px] sm:h-[3.5px] z-[100] pointer-events-none bg-ink-900/10"
      role="progressbar"
      aria-label="Article reading progress"
      aria-valuenow={rounded}
      aria-valuemin={0}
      aria-valuemax={100}
      title={`${rounded}% read · ${remaining}% remaining`}
    >
      <div
        className="h-full bg-gradient-to-r from-mint-400 via-mint-500 to-[#7b6dff] shadow-[0_0_8px_rgba(29,173,143,0.6)] transition-[width] duration-75 ease-out rounded-r-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgressBar;
