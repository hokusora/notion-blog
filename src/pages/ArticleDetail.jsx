import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Markdown from "react-markdown";
import { getArticleBySlug } from "../services/notion";
import ReadingProgressBar from "../components/ReadingProgressBar";
import TableOfContents from "../components/TableOfContents";
import NotionBlockRenderer from "../components/NotionBlockRenderer";
import SubPageCard from "../components/SubPageCard";
import { slugifyHeading } from "../utils/slugify";

// Helper to extract text from React children tree
function getChildrenText(children) {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(getChildrenText).join("");
  if (children && children.props && children.props.children) {
    return getChildrenText(children.props.children);
  }
  return "";
}

// Detect video URLs (e.g. .mp4, MIME video/mp4, or AWS S3 presigned video URLs)
function isVideoUrl(url, type) {
  if (!url && !type) return false;
  if (type && /video\/(mp4|webm|quicktime|mov)/i.test(String(type))) return true;
  if (!url) return false;
  const str = String(url).trim();
  try {
    const parsed = new URL(str, "https://dummy.base");
    const pathname = parsed.pathname.toLowerCase();
    if (
      pathname.endsWith(".mp4") ||
      pathname.endsWith(".webm") ||
      pathname.endsWith(".mov")
    ) {
      return true;
    }
    const contentType = parsed.searchParams.get("response-content-type");
    if (contentType && /video\/(mp4|webm|quicktime|mov)/i.test(contentType)) {
      return true;
    }
  } catch {
    // fallback if URL parsing throws
  }
  return /\.mp4(\?|#|$)/i.test(str) || /video\/mp4/i.test(str);
}

// Detect image URLs ending with .png, .jpg, .jpeg, .webp, .gif, or .svg (including AWS S3 signed URLs)
function isImageUrl(url) {
  if (!url) return false;
  return /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(String(url).trim());
}

// Detect PDF URLs ending with .pdf (including AWS S3 signed URLs)
function isPdfUrl(url) {
  if (!url) return false;
  return /\.pdf(\?.*)?$/i.test(String(url).trim());
}

const ArticleDetail = () => {
  const params = useParams();
  const { categorySlug, slug } = params;
  const wildcard = params["*"];

  // Compute full slug path (handles multi-level child pages like /japanese/nihonshi/edo-period)
  const fullPath = wildcard
    ? `${slug}/${wildcard}`.replace(/^\/+|\/+$/g, "")
    : (slug || "").replace(/^\/+|\/+$/g, "");

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const articleRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const fetchArticle = async () => {
      setLoading(true);
      const data = await getArticleBySlug(fullPath);
      setArticle(data);
      setLoading(false);
    };
    fetchArticle();
  }, [fullPath]);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="flex justify-center pt-20 pb-32 px-5">
        <div className="animate-pulse flex flex-col w-full max-w-3xl gap-5">
          <div className="h-3 w-44 bg-ink-300/40 rounded-full mx-auto" />
          <div className="h-10 bg-ink-300/40 rounded-xl w-4/5 mx-auto" />
          <div className="h-6 bg-ink-300/30 rounded-xl w-2/3 mx-auto mt-2" />
          <div className="aspect-[16/9] bg-ink-300/30 rounded-2xl w-full mt-6" />
          <div className="space-y-3 mt-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-3 bg-ink-300/20 rounded-full"
                style={{ width: `${[88, 76, 94, 82, 90, 70, 85, 78][i % 8]}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Not found / 404 state with parent redirect ──
  if (!article) {
    const segments = fullPath.split("/").filter(Boolean);
    const isSubPath = segments.length > 1;
    const parentPath = isSubPath ? segments.slice(0, -1).join("/") : null;
    const parentUrl = parentPath
      ? (categorySlug ? `/${categorySlug}/${parentPath}` : `/post/${parentPath}`)
      : null;

    return (
      <div className="text-center py-24 sm:py-32 px-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-pink-100/80 text-pink-600 flex items-center justify-center mx-auto mb-6 shadow-inner text-2xl">
          🔍
        </div>
        <span className="text-[11px] font-bold tracking-widest uppercase text-mint-700 bg-mint-100/70 px-3 py-1 rounded-full inline-block mb-3">
          {isSubPath ? "Sub-page Not Found" : "Article Not Found"}
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 mb-3">
          {isSubPath ? "This Sub-page Does Not Exist" : "Article Not Found"}
        </h1>
        <p className="text-ink-500 mb-8 text-sm leading-relaxed">
          {isSubPath
            ? "We could not find this specific sub-page under the parent article. It may have moved or been renamed."
            : "This post may have moved or been removed."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isSubPath && parentUrl && (
            <Link
              to={parentUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink-900 text-cream text-sm font-semibold rounded-full hover:bg-mint-600 transition-colors shadow-sm"
            >
              ← Back to Parent Article
            </Link>
          )}
          <Link
            to={categorySlug ? `/category/${categorySlug}` : "/"}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-full transition-colors ${
              isSubPath
                ? "border border-ink-300/80 text-ink-700 hover:bg-ink-100"
                : "bg-ink-900 text-cream hover:bg-mint-600 shadow-sm"
            }`}
          >
            {categorySlug
              ? `← Back to ${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}`
              : "← Back to Articles"}
          </Link>
        </div>
      </div>
    );
  }

  // ── Data extraction ──
  const post = article.fields || {};
  const { title, coverImage, content, blocks, date, tags, parentSlug, parentTitle } = post;
  const fontClass = post.fontClass || post.Font || post.font || "font-default";
  const textColor = post.textColor || post.TextColor || post.text_color || post.Color || post.color || "#30a6a6";

  // Dedicated sub-page cover or root article cover
  let imageUrl = coverImage?.fields?.file?.url || (typeof coverImage === "string" ? coverImage : null);

  // If sub-page has no cover set, fall back to first inline image block inside this sub-page (do NOT inherit parent's cover)
  if (!imageUrl && Array.isArray(blocks)) {
    const firstImgBlock = blocks.find((b) => b.type === "image");
    if (firstImgBlock?.image) {
      imageUrl = firstImgBlock.image.file?.url || firstImgBlock.image.external?.url || null;
    }
  }

  const currentCategorySlug =
    categorySlug || article.fields.category?.fields?.slug || "general";
  const currentCategoryTitle =
    article.fields.category?.fields?.title ||
    currentCategorySlug.charAt(0).toUpperCase() + currentCategorySlug.slice(1);

  // Dynamic Breadcrumbs: Home > Category > Parent Article > ... > Current Page
  let breadcrumbs = article.fields.breadcrumbs;
  if (!breadcrumbs || !Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
    const segments = fullPath.split("/").filter(Boolean);
    breadcrumbs = [
      { title: "Home", path: "/" },
      { title: currentCategoryTitle, path: `/category/${currentCategorySlug}` },
    ];
    let acc = "";
    for (let i = 0; i < segments.length; i++) {
      acc = acc ? `${acc}/${segments[i]}` : segments[i];
      const isCurrent = i === segments.length - 1;
      let segTitle = segments[i];
      try {
        segTitle = decodeURIComponent(segTitle);
      } catch {
        // fallback
      }
      breadcrumbs.push({
        title: isCurrent ? title : segTitle.replace(/-/g, " "),
        path: `/${currentCategorySlug}/${acc}`,
      });
    }
  } else {
    // Ensure all breadcrumb titles are decoded and properly formatted
    breadcrumbs = breadcrumbs.map((crumb) => {
      try {
        return {
          ...crumb,
          title: decodeURIComponent(crumb.title),
        };
      } catch {
        return crumb;
      }
    });
  }

  // Back link: points to parent article if nested sub-page, else category
  const isNestedSubPage = Boolean(parentSlug || fullPath.includes("/"));
  let backUrl;
  let backLabel;

  if (isNestedSubPage) {
    const parentPathSegment = parentSlug || fullPath.split("/").slice(0, -1).join("/");
    backUrl = categorySlug
      ? `/${categorySlug}/${parentPathSegment}`
      : `/post/${parentPathSegment}`;
    backLabel = `← Back to ${parentTitle || "Parent Article"}`;
  } else if (categorySlug) {
    backUrl = `/category/${categorySlug}`;
    backLabel = `← Back to ${currentCategoryTitle}`;
  } else {
    backUrl = "/";
    backLabel = "← Back to Articles";
  }

  // Markdown custom components matching editorial aesthetic
  const markdownComponents = {
    h1: ({ children, ...props }) => (
      <h1
        className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-8 mb-4 text-ink-900 leading-tight"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, id: explicitId, ...props }) => {
      const text = getChildrenText(children);
      const id = explicitId || slugifyHeading(text);
      return (
        <h2
          id={id}
          className="text-xl sm:text-2xl md:text-3xl font-bold mt-7 mb-3 text-ink-800 leading-tight scroll-mt-24 group relative"
          {...props}
        >
          <span>{children}</span>
          <a
            href={`#${id}`}
            className="opacity-0 group-hover:opacity-100 ml-2 text-mint-500 hover:text-mint-600 transition-opacity text-base font-sans font-normal inline-block select-none"
            aria-label={`Link to section: ${text}`}
            title="Direct link to section"
          >
            #
          </a>
        </h2>
      );
    },
    h3: ({ children, id: explicitId, ...props }) => {
      const text = getChildrenText(children);
      const id = explicitId || slugifyHeading(text);
      return (
        <h3
          id={id}
          className="text-lg sm:text-xl md:text-2xl font-semibold mt-6 mb-2 text-ink-700 leading-snug scroll-mt-24 group relative"
          {...props}
        >
          <span>{children}</span>
          <a
            href={`#${id}`}
            className="opacity-0 group-hover:opacity-100 ml-2 text-mint-500 hover:text-mint-600 transition-opacity text-sm font-sans font-normal inline-block select-none"
            aria-label={`Link to subsection: ${text}`}
            title="Direct link to subsection"
          >
            #
          </a>
        </h3>
      );
    },
    p: ({ children, ...props }) => {
      const childArray = Array.isArray(children) ? children : [children];
      const isSingleSpecialChild =
        childArray.length === 1 &&
        childArray[0] &&
        typeof childArray[0] === "object" &&
        childArray[0].props &&
        (isVideoUrl(childArray[0].props.href, childArray[0].props.type) ||
          isImageUrl(childArray[0].props.href) ||
          isPdfUrl(childArray[0].props.href) ||
          String(childArray[0].props.children || "").startsWith("child_page:"));

      if (isSingleSpecialChild) {
        return <>{children}</>;
      }

      return (
        <p
          className="mb-6 leading-[1.85] text-[1.25rem]"
          {...props}
        >
          {children}
        </p>
      );
    },
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-mint-400 pl-6 py-4 my-8 bg-mint-50/80 rounded-r-xl text-ink-800 italic text-lg leading-relaxed shadow-sm"
        {...props}
      >
        {children}
      </blockquote>
    ),
    a: ({ children, href, type, ...props }) => {
      const childText = getChildrenText(children);

      // Detect child_page block links from markdown (e.g. [child_page:Title](slug))
      if (childText.startsWith("child_page:") || href?.startsWith("child_page:")) {
        const subPageTitle = childText.replace(/^child_page:\s*/, "") || href.replace(/^child_page:\s*/, "");
        return (
          <SubPageCard
            title={subPageTitle}
            childSlug={href}
            categorySlug={currentCategorySlug}
            parentSlug={fullPath}
          />
        );
      }

      // Detect video links
      if (isVideoUrl(href, type)) {
        return (
          <div className="my-6 w-full overflow-hidden rounded-2xl shadow-md bg-black/5">
            <video
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-[500px] object-contain mx-auto"
              src={href}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }

      // Detect image links strictly inline with captions
      if (isImageUrl(href)) {
        const altText = childText || "Post media";
        return (
          <figure className="my-6 w-full flex flex-col items-center">
            <img
              src={href}
              alt={altText}
              loading="lazy"
              className="w-full max-h-[650px] object-contain rounded-2xl shadow-sm border border-pink-100/50"
            />
            {altText && altText !== "Post media" && (
              <figcaption className="mt-2 text-center text-xs text-ink-500 font-sans italic">
                {altText}
              </figcaption>
            )}
          </figure>
        );
      }

      // Detect PDF links
      if (isPdfUrl(href)) {
        return (
          <div className="my-6 w-full rounded-2xl overflow-hidden border border-pink-200/60 shadow-sm bg-white">
            <div className="bg-pink-50/80 px-4 py-2 border-b border-pink-100 flex items-center justify-between text-xs text-gray-600 font-medium">
              <span>📄 Document Preview</span>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:underline"
              >
                Download / Full View ↗
              </a>
            </div>
            <iframe
              src={`${href}#toolbar=1`}
              className="w-full h-[600px] border-none"
              title="PDF Preview"
            />
          </div>
        );
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-mint-600 underline underline-offset-2 decoration-mint-300 hover:text-mint-700 hover:decoration-mint-500 transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    },
    img: ({ src, alt, ...props }) => (
      <figure className="my-6 w-full flex flex-col items-center">
        <img
          src={src}
          alt={alt || "Post media"}
          loading="lazy"
          className="w-full max-h-[650px] object-contain rounded-2xl shadow-sm border border-pink-100/50"
          {...props}
        />
        {alt && alt !== "Post media" && (
          <figcaption className="mt-2.5 text-center text-xs text-ink-500 font-sans italic max-w-xl">
            {alt}
          </figcaption>
        )}
      </figure>
    ),
    ul: ({ children, ...props }) => (
      <ul className="list-none pl-0 mb-6 space-y-3" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol
        className="list-decimal pl-6 mb-6 space-y-3 text-ink-700 font-['Angel'] text-[1.25rem]"
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li
        className="pl-6 relative text-ink-700 font-['Angel'] text-[1.25rem] leading-relaxed before:content-['—'] before:absolute before:left-0 before:text-mint-500 before:font-bold"
        {...props}
      >
        {children}
      </li>
    ),
    hr: () => <hr className="border-0 border-t border-ink-300/40 my-10" />,
    strong: ({ children, ...props }) => (
      <strong className="font-bold text-inherit" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic text-inherit" {...props}>
        {children}
      </em>
    ),
    u: ({ children, ...props }) => (
      <u className="underline underline-offset-4 decoration-current" {...props}>
        {children}
      </u>
    ),
    del: ({ children, ...props }) => (
      <del className="line-through" {...props}>
        {children}
      </del>
    ),
    code: ({ inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code
            className="bg-ink-100/60 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono font-medium"
            {...props}
          >
            {children}
          </code>
        );
      }
      const lang = className?.replace("language-", "") || "code";
      return (
        <div className="my-8 rounded-xl overflow-hidden shadow-card border border-ink-300/30">
          <div className="bg-ink-800 px-4 py-2 flex items-center justify-between text-xs text-ink-300 font-mono border-b border-ink-700">
            <span>{lang}</span>
          </div>
          <pre className="bg-ink-900 text-cream p-5 overflow-x-auto text-sm font-mono leading-relaxed">
            <code {...props}>{children}</code>
          </pre>
        </div>
      );
    },
  };

  return (
    <>
      <ReadingProgressBar targetRef={articleRef} />
      <div className="w-full flex justify-center items-start gap-8 lg:gap-10 xl:gap-14">
        {/* Main Article Content */}
        <article
          ref={articleRef}
          className={`w-full max-w-3xl shrink-1 min-w-0 article-container ${fontClass}`}
          style={{ "--article-text-color": textColor }}
        >
          {/* Dynamic Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-ink-500"
          >
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <span
                  key={crumb.path || idx}
                  className="inline-flex items-center gap-1.5"
                >
                  {idx > 0 && (
                    <span className="text-ink-300 select-none">›</span>
                  )}
                  {isLast ? (
                    <span className="font-semibold text-mint-700 tracking-wide line-clamp-1 max-w-[200px] sm:max-w-xs">
                      {crumb.title}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="hover:text-ink-900 transition-colors font-medium hover:underline underline-offset-2"
                    >
                      {crumb.title}
                    </Link>
                  )}
                </span>
              );
            })}
          </nav>

          {/* Contextual Back link */}
          <Link
            to={backUrl}
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-mint-600 mb-10 transition-colors group"
          >
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {backLabel}
          </Link>

          {/* Article header */}
          <header className="mb-12 text-center">
            {/* Tags + date row */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-7">
              {tags?.map((tag) => (
                <span key={tag} className="badge-mint">
                  {tag}
                </span>
              ))}
              {tags && tags.length > 0 && (
                <span className="text-ink-300 text-xs mx-1">·</span>
              )}
              <time className="text-mint-600 text-xs font-medium tracking-wide">
                {new Date(date || article.sys.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </time>
            </div>

            {/* Title */}
            <h1
              className="article-detail-title font-['MomoSignature'] text-[2rem] md:text-[2.25rem] lg:text-[4.25rem] font-bold tracking-tight leading-[1.15] mb-0"
              style={{ color: "#4e056e" }}
            >
              {title}
            </h1>
          </header>

          {/* Standalone Hero Banner or Clean Gradient Placeholder (No icon overlay) */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-sm mb-8"
            />
          ) : (
            <div className="w-full h-48 md:h-64 rounded-2xl shadow-sm mb-8 border border-ink-300/20 bg-gradient-to-br from-mint-500/10 via-pink-500/10 to-indigo-500/10 p-8 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] uppercase tracking-widest font-bold text-mint-700 bg-mint-100/80 px-3 py-1 rounded-full mb-2">
                {isNestedSubPage ? "Sub-page Document" : (currentCategoryTitle || "Article")}
              </span>
              <p className="font-serif text-ink-600 text-sm italic max-w-md">
                {title}
              </p>
            </div>
          )}

          {/* Thin rule before body */}
          <div className="border-t border-ink-300/50 mb-10" />

          {/* Mobile / Tablet Collapsible Table of Contents */}
          <div className="lg:hidden">
            <TableOfContents content={content} blocks={blocks} variant="mobile" />
          </div>

          {/* 
            Sequential Block Renderer:
            Blocks (paragraphs, headings, callouts, quotes, images, videos, child_page cards)
            render strictly in their inline sequential order within the text.
          */}
          <div className="article-body">
            {blocks && Array.isArray(blocks) && blocks.length > 0 ? (
              <NotionBlockRenderer
                blocks={blocks}
                categorySlug={currentCategorySlug}
                parentSlug={fullPath}
              />
            ) : (
              <Markdown components={markdownComponents}>
                {typeof content === "string" ? content : ""}
              </Markdown>
            )}
          </div>

          {/* End of article — back button */}
          <div className="mt-20 pt-8 border-t border-ink-300/50 flex justify-center">
            <Link
              to={backUrl}
              className="inline-flex items-center gap-2 px-7 py-3 border border-ink-900 text-ink-900 text-sm font-semibold rounded-full hover:bg-ink-900 hover:text-cream transition-all duration-200"
            >
              {backLabel}
            </Link>
          </div>
        </article>

        {/* Desktop Sticky Side Table of Contents */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24 pt-2">
          <TableOfContents content={content} blocks={blocks} variant="desktop" />
        </aside>
      </div>
    </>
  );
};

export default ArticleDetail;
