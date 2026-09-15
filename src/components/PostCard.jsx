import { Link } from "react-router-dom";

// ============================================================
// POST CARD — Editorial layout card.
// Data bindings: article.fields.title, slug, excerpt,
//                coverImage, tags — ALL UNCHANGED.
// ============================================================

// Rotate through badge variants for visual rhythm
const BADGE_VARIANTS = ["badge-mint", "badge-blush", "badge-neutral"];

export default function PostCard({ article, index = 0, theme = {} }) {
  // ── Original data extraction — UNCHANGED ──
  const { title, slug, excerpt, coverImage, tags } = article.fields;

  // Original image URL logic — UNCHANGED
  const imageUrl = coverImage?.fields?.file?.url || "";

  // Lấy category từ linked entry (References field), fallback về tags
  const categoryEntry = article.fields.category;
  const categoryData = Array.isArray(categoryEntry)
    ? categoryEntry[0]
    : categoryEntry;
  const categoryName =
    categoryData?.fields?.title ||
    (tags && tags.length > 0 ? tags[0] : "VOCAB | JEONJA");
  const categorySlug = categoryData?.fields?.slug || null;

  // Pick badge colour by card index for visual variety
  const badgeClass = BADGE_VARIANTS[index % BADGE_VARIANTS.length];
  const badgeStyle = theme.badgeStyle || null;

  // ── URL: /:categorySlug/:slug nếu có category, fallback /post/:slug ──
  const articleUrl = categorySlug
    ? `/${categorySlug}/${slug}`
    : `/post/${slug}`;

  return (
    <Link to={articleUrl} className="group flex flex-col cursor-pointer h-full">
      {/* ── Cover image ── */}
      {imageUrl && (
        <div className="card-img-wrapper aspect-[4/3] rounded-2xl bg-ink-100 mb-5 shadow-card overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-103"
          />
        </div>
      )}

      {/* ── Category badge ── */}
     <div className="mb-3">
        {categorySlug ? (
          <Link
            to={`/category/${categorySlug}`}
            className={`${badgeStyle ? "" : badgeClass} hover:opacity-75 transition-opacity duration-200`}
            style={badgeStyle ? {
              ...badgeStyle,
              display: "inline-block",
              padding: "2px 10px",
              borderRadius: "9999px",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            } : {}}
            onClick={(e) => e.stopPropagation()}
          >
            {categoryName}
          </Link>
        ) : (
          <span
            className={`${badgeStyle ? "" : badgeClass}`}
            style={badgeStyle ? {
              ...badgeStyle,
              display: "inline-block",
              padding: "2px 10px",
              borderRadius: "9999px",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            } : {}}
          >
            {categoryName}
          </span>
        )}
      </div>

      {/* ── Title (serif) ── */}
      <h2
        className="font-['MomoSignature'] text-[18px] md:text-[24px] font-bold leading-snug mb-3 transition-colors duration-300"
        style={{ color: theme.cardTitleColor || "#9370db" }}
      >
        {title}
      </h2>

      {/* ── Excerpt ── */}
      <p
        className="font-['Angel'] text-[12px] md:text-[14px]"
        style={{ color: theme.cardExcerptColor || "#191970" }}
      >
        {excerpt}
      </p>

      {/* ── Read more ── */}
      <div className="mt-auto flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-900">
        <span className="underline-grow">Read Article</span>
        <svg
          className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </div>
    </Link>
  );
}
