import { Link } from "react-router-dom";
import { slugify } from "../utils/slugify";

/**
 * SubPageCard
 * Renders an independent, beautifully styled sub-article card for Notion child_page blocks.
 * Supports multiple siblings, sub-page covers, icons, excerpts, and accurate relative nesting.
 */
export default function SubPageCard({
  title,
  childSlug,
  categorySlug,
  parentSlug,
  targetUrl,
  icon,
  cover,
  excerpt,
}) {
  // Normalize child slug to leaf segment
  let leafSlug = childSlug || slugify(title);
  if (typeof leafSlug === "string" && leafSlug.includes("/")) {
    const parts = leafSlug.split("/").filter(Boolean);
    leafSlug = parts[parts.length - 1];
  }
  const resolvedSlug = slugify(leafSlug);

  const cleanParent = parentSlug ? String(parentSlug).replace(/^\/+|\/+$/g, "") : "";
  const cleanCategory = categorySlug ? String(categorySlug).replace(/^\/+|\/+$/g, "") : "";

  let destinationUrl = targetUrl;
  if (!destinationUrl) {
    if (cleanCategory) {
      destinationUrl = cleanParent
        ? `/${cleanCategory}/${cleanParent}/${resolvedSlug}`
        : `/${cleanCategory}/${resolvedSlug}`;
    } else {
      destinationUrl = cleanParent
        ? `/post/${cleanParent}/${resolvedSlug}`
        : `/post/${resolvedSlug}`;
    }
  }

  // Clean Page Titles: Strip leading emojis so only clean text title is displayed
  const cleanTitle = String(title || "Untitled Sub-page")
    .replace(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u, "")
    .trim() || "Untitled Sub-page";

  // Render icon: custom emoji, image URL, or default SVG document icon
  const isEmoji = typeof icon === "string" && !icon.startsWith("http") && icon.length <= 4;
  const isIconUrl = typeof icon === "string" && (icon.startsWith("http") || icon.startsWith("/"));

  return (
    <div className="my-7">
      <Link
        to={destinationUrl}
        className="subpage-card group flex items-stretch overflow-hidden rounded-2xl p-0 border border-ink-300/20 bg-cream/50 shadow-sm
                   hover:shadow-card hover:border-mint-400/80 transition-all duration-200 no-underline"
      >
        {/* Cover Thumbnail OR Gradient Placeholder */}
        {cover ? (
          <div className="w-44 sm:w-56 shrink-0 relative overflow-hidden self-stretch m-0 bg-ink-100">
            <img
              src={cover}
              alt={cleanTitle}
              loading="lazy"
              className="w-full h-full object-cover block absolute inset-0 m-0 p-0 rounded-none shadow-none group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="w-44 sm:w-56 shrink-0 relative overflow-hidden self-stretch m-0 bg-gradient-to-br from-mint-500/15 via-pink-500/10 to-indigo-500/15 flex items-center justify-center border-r border-ink-300/20 p-4">
            <div className="w-12 h-12 rounded-xl bg-cream/90 shadow-sm border border-ink-300/30 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
              {isEmoji ? (
                <span>{icon}</span>
              ) : isIconUrl ? (
                <img src={icon} alt="" className="w-6 h-6 object-contain" />
              ) : (
                <span>{icon || "📜"}</span>
              )}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider text-mint-700 bg-mint-100/70 px-2.5 py-0.5 rounded-full">
                Nested Chapter
              </span>
              <span className="text-xs text-ink-400">· Click to explore</span>
            </div>
            <h4
              className="subpage-card-title font-serif text-xl sm:text-2x1 font-bold transition-colors leading-snug line-clamp-2 group-hover:opacity-80"
              style={{ color: "#4e056e" }}
            >
              {cleanTitle}
            </h4>
            {excerpt && (
              <p className="text-xs sm:text-sm text-ink-500 line-clamp-2 mt-1.5 leading-relaxed font-sans">
                {excerpt}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-mint-600 group-hover:text-mint-700 group-hover:translate-x-1 transition-all">
              <span>Read Chapter</span>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
