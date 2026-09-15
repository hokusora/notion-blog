import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { getArticleBySlug } from "../services/contentful";

// ── Rich text render options — UNCHANGED ──
const renderOptions = {
  renderNode: {
    // Paragraph
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-6 leading-[1.85] text-[2.5rem] text-[#d98079] font-['Angel']">
        {/* đã đổi màu hex #d98079 và thêm font Angel */}
        {children}
      </p>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2
        className="font-serif text-[1.75rem] font-bold text-ink-900
                   mt-14 mb-5 leading-tight tracking-tight"
      >
        {children}
      </h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3
        className="font-serif text-[1.35rem] font-bold text-ink-900
                   mt-10 mb-4 leading-snug"
      >
        {children}
      </h3>
    ),
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote
        className="border-l-2 border-mint-400 pl-6 py-3 my-10
                             bg-mint-50 rounded-r-xl text-ink-700 italic
                             text-lg leading-relaxed"
      >
        {children}
      </blockquote>
    ),
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={node.data.uri}
        target="_blank"
        rel="noopener noreferrer"
        className="text-mint-600 underline underline-offset-2 decoration-mint-300
                   hover:text-mint-700 hover:decoration-mint-500 transition-colors"
      >
        {children}
      </a>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { url, title } = node.data.target.fields.file;
      return (
        <img
          src={`https:${url}`}
          alt={title || "Embedded content"}
          className="rounded-2xl my-10 w-full shadow-card"
        />
      );
    },
  },
};

// 🛠️ BỘ LỌC THÔNG MINH TỰ ĐỘNG NHẬN DIỆN FILE S3
const S3MediaViewer = ({ url }) => {
  if (!url) return null;

  // 1. Lấy đuôi file từ URL (ví dụ: mp4, pdf, png)
  const extension = url.split(".").pop().toLowerCase();

  // 2. Phân loại các nhóm đuôi file
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const videoExts = ["mp4", "webm", "mov"];
  const audioExts = ["mp3", "wav", "ogg"];
  const pdfExt = ["pdf"];

  // 3. Tự động trả về thẻ HTML tương ứng với loại file
  if (imageExts.includes(extension)) {
    return (
      <img
        src={url}
        alt="Minh họa đính kèm"
        className="w-full h-auto rounded-xl shadow-md my-6"
      />
    );
  }

  if (videoExts.includes(extension)) {
    return (
      <video
        controls
        className="w-full h-auto rounded-xl shadow-md my-6 bg-black"
      >
        <source
          src={url}
          type={`video/${extension === "mov" ? "mp4" : extension}`}
        />
        Trình duyệt của bồ không hỗ trợ xem video.
      </video>
    );
  }

  if (audioExts.includes(extension)) {
    return (
      <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
        <p className="text-sm text-ink-600 font-semibold mb-2 flex items-center gap-2">
          🎧 File âm thanh đính kèm
        </p>
        <audio controls className="w-full">
          <source
            src={url}
            type={`audio/${extension === "mp3" ? "mpeg" : extension}`}
          />
          Trình duyệt của bồ không hỗ trợ nghe audio.
        </audio>
      </div>
    );
  }

  if (pdfExt.includes(extension)) {
    return (
      <iframe
        src={url}
        className="w-full h-[600px] my-6 rounded-lg shadow-sm border border-gray-200"
        title="PDF Viewer"
      ></iframe>
    );
  }

  // 4. Mặc định (Dành cho file code, zip, docx...): Tự động biến thành NÚT TẢI XUỐNG
  return (
    <div className="my-6">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-mint-600 hover:bg-mint-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
      >
        <span>📁 Nhấn để xem / Tải xuống tệp đính kèm (.{extension})</span>
      </a>
    </div>
  );
};

const ArticleDetail = () => {
  // ── slug lấy từ URL /:categorySlug/:slug ──
  const { slug, categorySlug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      const data = await getArticleBySlug(slug);
      setArticle(data);
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  // ── Loading skeleton — UNCHANGED ──
  if (loading) {
    return (
      <div className="flex justify-center pt-20 pb-32 px-5">
        <div className="animate-pulse flex flex-col w-full max-w-3xl gap-5">
          <div className="h-3 w-28 bg-ink-300/40 rounded-full mx-auto" />
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

  // ── Not found — UNCHANGED ──
  if (!article) {
    return (
      <div className="text-center py-32">
        <span className="text-5xl mb-6 block">🔍</span>
        <p className="font-serif text-2xl font-bold text-ink-900 mb-2">
          Article not found
        </p>
        <p className="text-ink-500 mb-8">
          This post may have moved or been removed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ink-900 text-cream
                     text-sm font-semibold rounded-full hover:bg-mint-600 transition-colors duration-200"
        >
          ← Back to articles
        </Link>
      </div>
    );
  }

  // ── Original data extraction — UNCHANGED ──
  const { title, coverImage, content, date, tags } = article.fields;
  const imageUrl = coverImage?.fields?.file?.url;

  // Back link: về trang category nếu có, về home nếu không
  const backUrl = categorySlug ? `/category/${categorySlug}` : "/";
  const backLabel = categorySlug
    ? `← Back to ${
        categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
      }`
    : "← Back to articles";

  return (
    <article className="max-w-3xl mx-auto px-5 sm:px-0 py-12 md:py-20">
      {/* ── Back link — trỏ về category thay vì hardcode "/" ── */}
      <Link
        to={backUrl}
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-500
                   hover:text-mint-600 mb-12 transition-colors group"
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

      {/* ── Article header — UNCHANGED ── */}
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

        {/* Title — large serif */}
        <h1
          // Đã cấu hình sang màu hex #7b6dff và font Monday
          className="font-['MomoSignature'] text-[2rem] md:text-[1.75rem] lg:text-[4.25rem]
 font-bold text-[#7b6dff] tracking-tight leading-[1.15] mb-0"
        >
          {title}
        </h1>
      </header>

      {/* ── Cover image — UNCHANGED ── */}
      {imageUrl && (
        <div className="mb-14 rounded-2xl overflow-hidden shadow-card-lg border border-ink-300/30">
          <img
            src={imageUrl}
            alt={title}
            className="w-full object-cover max-h-[520px]"
          />
        </div>
      )}

      {/* ── Thin rule before body — UNCHANGED ── */}
      <div className="border-t border-ink-300/50 mb-12" />

      {/* Chỗ này kiểm tra xem bài viết có gắn link s3Url không, nếu có thì nhét vào cỗ máy S3MediaViewer */}

      {article.fields.s3Url && <S3MediaViewer url={article.fields.s3Url} />}

      {/* ── Rich text body — UNCHANGED ── */}
      <div className="article-body">
        {documentToReactComponents(content, renderOptions)}
      </div>

      {/* ── End of article — back về category ── */}
      <div className="mt-20 pt-8 border-t border-ink-300/50 flex justify-center">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-2 px-7 py-3 border border-ink-900 text-ink-900
                     text-sm font-semibold rounded-full hover:bg-ink-900 hover:text-cream
                     transition-all duration-200"
        >
          {backLabel}
        </Link>
      </div>
    </article>
  );
};

export default ArticleDetail;
