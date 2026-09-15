// src/pages/CategoryPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArticlesByCategory } from "../services/notion";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";

// ── Màu riêng từng category — thêm/sửa slug và màu tùy ý ──
const CATEGORY_THEMES = {
  korean: {
    gradient: "linear-gradient(135deg, #ffd0e3 0%, #fff2d8 40%, #ffd0e3 70%)",
    titleColor: "#c2185b",
    navLinkColor: "#c2185b",
    navLinkHover: "#e46e7a",
    navLogoColor: "#c2185b",
    cardTitleColor: "#c2185b",
    cardExcerptColor: "#a0516a",
    badgeStyle: { background: "#ffd0e3", color: "#c2185b" },
  },
  japanese: {
    gradient: "linear-gradient(135deg, #f9c6d4 0%, #faf9f6 30%, #f9c6d4 75%)",
    titleColor: "#7b1fa2",
    navLinkColor: "#7b1fa2",
    navLinkHover: "#ab47bc",
    navLogoColor: "#7b1fa2",
    cardTitleColor: "#7b1fa2",
    cardExcerptColor: "#6a3a7a",
    badgeStyle: { background: "#ffd0e3", color: "#c2185b" },
  },
  korea: {
    gradient: "linear-gradient(150deg, #bed9f4 0%, #bed9f4 50%, #fdfdf1 70%)",
    titleColor: "#1565c0",
    navLinkColor: "#1565c0",
    navLinkHover: "#1976d2",
    navLogoColor: "#1565c0",
    cardTitleColor: "#1565c0",
    cardExcerptColor: "#37597a",
    badgeStyle: { background: "#f9f5ff", color: "#0998ae" },
  },
  content: {
    gradient: "linear-gradient(135deg, #bfd9ff 0%, #8aa6f3 50%)",
    titleColor: "#f640dedf",
    navLinkColor: "#626ef3",
    navLinkHover: "#c5eeff",
    navLogoColor: "#1a237e",
    cardTitleColor: "#1a237e",
    cardExcerptColor: "#3a4a7a",
    badgeStyle: { background: "#ffffff", color: "#4a67e8" },
  },
  chaebol: {
    gradient: "linear-gradient(100deg, #ffd0e3 0%, #fff2d8 100%)",
    titleColor: "#ad1457",
    navLinkColor: "#ad1457",
    navLinkHover: "#e91e8c",
    navLogoColor: "#ad1457",
    cardTitleColor: "#ad1457",
    cardExcerptColor: "#7a3050",
    badgeStyle: { background: "#fce4ec", color: "#ad1457" },
  },
  apateu: {
    gradient: "linear-gradient(135deg, #1a003d 0%, #49ad93 50%, #c5b1d2 100%)",
    titleColor: "#00fff2",
    navLinkColor: "#e5e5e5",
    navLinkHover: "#919cfc",
    navLogoColor: "#e0f2f1",
    cardTitleColor: "#c5b1d2",
    cardExcerptColor: "#f09b11",
    badgeStyle: { background: "#f3f4c9", color: "#756ff0" },
  },
  default: {
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    titleColor: "#f1f5f9",
    navLinkColor: "#e46e7a",
    navLinkHover: "#7b6dff",
    navLogoColor: "#f1f5f9",
    cardTitleColor: "#9370db",
    cardExcerptColor: "#6b7280",
    badgeStyle: { background: "#e0f2f1", color: "#00695c" },
  },
};

// ── Số bài mỗi trang ──
const POSTS_PER_PAGE = 9;

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setCurrentPage(1); // reset về trang 1 khi đổi category
      const data = await getArticlesByCategory(categorySlug);
      setArticles(data);
      setLoading(false);
    };
    fetch();
  }, [categorySlug]);

  const categoryLabel =
    categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  const theme = CATEGORY_THEMES[categorySlug] || CATEGORY_THEMES.default;

  // ── Tính toán pagination ──
  const totalPages = Math.ceil(articles.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentArticles = articles.slice(startIndex, endIndex);

  // ── Đổi trang + scroll lên đầu ──
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Tạo danh sách số trang hiển thị (có dấu "...") ──
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
    return pages;
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: (CATEGORY_THEMES[categorySlug] || CATEGORY_THEMES.default)
            .gradient,
        }}
      >
        <Navbar theme={theme} />
        <main className="flex-grow w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4 animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-ink-300/20" />
                <div className="h-4 bg-ink-300/20 rounded w-1/4" />
                <div className="h-6 bg-ink-300/20 rounded w-3/4" />
                <div className="h-4 bg-ink-300/20 rounded w-full" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: (CATEGORY_THEMES[categorySlug] || CATEGORY_THEMES.default)
          .gradient,
      }}
    >
      <Navbar theme={theme} />
      <main className="flex-grow w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16">
        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-ink-300/40 pb-8 mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-mint-600 block mb-2">
              Category Archive
            </span>
            <h1
              className="text-4xl md:text-[3.25rem] font-bold tracking-tight leading-[1.1]"
              style={{
                color: (
                  CATEGORY_THEMES[categorySlug] || CATEGORY_THEMES.default
                ).titleColor,
              }}
            >
              {categoryLabel}
            </h1>
            <p className="mt-4 text-2xl leading-relaxed max-w-lg font-['Angel'] text-[#d98079]">
              All articles in the <strong>{categoryLabel}</strong> category.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="badge-mint text-xs px-4 py-2 rounded-full">
              {articles.length} Articles
            </span>
          </div>
        </header>

        {/* ── Grid — chỉ render bài của trang hiện tại ── */}
        {articles.length === 0 ? (
          <p className="text-ink-500 text-center py-20">
            No articles found in this category.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
            {currentArticles.map((article, index) => (
              <PostCard
                key={article.sys.id}
                article={article}
                index={index}
                theme={theme}
              />
            ))}
          </div>
        )}

        {/* ── Pagination — chỉ hiện khi có nhiều hơn 1 trang ── */}
        {totalPages > 1 && (
          <div className="mt-24 flex justify-center items-center gap-1">
            {/* Nút Prev */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="w-10 h-10 flex items-center justify-center rounded-full text-ink-400
                         hover:bg-mint-100 hover:text-mint-700 transition-all duration-200
                         disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Số trang */}
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-10 h-10 flex items-center justify-center text-sm text-ink-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  aria-current={currentPage === page ? "page" : undefined}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200
                    ${
                      currentPage === page
                        ? "bg-ink-900 text-cream font-semibold"
                        : "text-ink-600 hover:bg-mint-100 hover:text-mint-700"
                    }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Nút Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="w-10 h-10 flex items-center justify-center rounded-full text-ink-700
                         hover:bg-mint-100 hover:text-mint-700 transition-all duration-200
                         disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* ── "Trang X / Y" ── */}
        {totalPages > 1 && (
          <p className="mt-4 text-center text-xs text-ink-400">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </main>

      <footer
        className="border-t border-white/10 mt-16"
        style={{
          background: "rgba(195, 194, 194, 0.13)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-serif text-base font-bold text-ink-900">
            Hoku Sol
          </span>
          <p className="text-sm text-ink-500 text-center md:text-right">
            © {new Date().getFullYear()} Hoku Sol. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
