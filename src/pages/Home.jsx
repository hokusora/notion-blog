import { useEffect, useState } from "react";
import { getArticles } from "../services/contentful";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";

// ── Số bài mỗi trang ──
const POSTS_PER_PAGE = 9;

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchArticles = async () => {
      const data = await getArticles();
      setArticles(data);
      setLoading(false);
    };
    fetchArticles();
  }, []);

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
      <div className="min-h-screen bg-blog-gradient flex flex-col">
        <Navbar />
        <main className="flex-grow w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 md:py-24">
          <div className="mb-16 space-y-4">
            <div className="h-3 w-40 bg-ink-300/40 rounded-full animate-pulse" />
            <div className="h-10 w-72 bg-ink-300/40 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-ink-300/30 rounded-full animate-pulse mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4 animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-ink-300/30" />
                <div className="h-3 w-20 bg-ink-300/30 rounded-full" />
                <div className="h-5 w-3/4 bg-ink-300/40 rounded-lg" />
                <div className="h-3 w-full bg-ink-300/20 rounded-full" />
                <div className="h-3 w-4/5 bg-ink-300/20 rounded-full" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blog-gradient font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 md:py-20">
        {/* ── Category hero header ── */}
        <header className="mb-16 md:mb-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[10px] font-semibold tracking-ultra-wide text-ink-500 uppercase">
              Home
            </span>
            <span className="text-ink-300 text-xs">›</span>
            <span className="text-[10px] font-semibold tracking-ultra-wide text-ink-500 uppercase">
              Hangug
            </span>
            <span className="text-ink-300 text-xs">›</span>
            <span className="text-[10px] font-semibold tracking-ultra-wide text-mint-600 uppercase">
              Jeonja
            </span>
          </div>

          {/* Title row */}
          <div
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4
                          border-b border-ink-300/60 pb-8"
          >
            <div>
              <h1
                className="font-serif text-[2.5rem] md:text-[3.25rem] font-bold text-ink-900
                             tracking-tight leading-[1.1]"
              >
                Culture{" "}
                <span className="font-normal italic text-mint-600">
                  &amp; Others
                </span>
                <span className="ml-3 text-3xl">🎎</span>
              </h1>
              <p className="mt-4 text-2xl leading-relaxed max-w-lg font-['Angel'] text-[#d98079]">
                Dive into the heart of South Korea. Explore traditions, modern
                lifestyle, and everything in between.
              </p>
            </div>

            {/* Article count badge */}
            <div className="flex-shrink-0">
              <span className="badge-mint text-xs px-4 py-2 rounded-full">
                {articles.length} Articles
              </span>
            </div>
          </div>
        </header>

        {/* ── Post grid — chỉ render bài của trang hiện tại ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
          {currentArticles.map((article, index) => (
            <PostCard key={article.sys.id} article={article} index={index} />
          ))}
        </div>

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

        {/* ── Hiển thị "Trang X / Y" nhỏ bên dưới pagination ── */}
        {totalPages > 1 && (
          <p className="mt-4 text-center text-xs text-ink-400">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        className="border-t border-white/10 mt-16"
        style={{
          background: "rgba(234, 228, 228, 0.51)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
        }}
      >
        <div
          className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12
                        flex flex-col md:flex-row justify-between items-center gap-6"
        >
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-500" />
            <span className="font-serif text-base font-bold text-ink-900 tracking-tight"></span>
          </div>

          <p className="text-xs text-ink-500 order-last md:order-none">
            © {new Date().getFullYear()} Hoku Sol. All rights reserved.
          </p>

          {/* Footer links */}
          <div className="flex gap-6 text-xs text-ink-500">
            <a
              href="#"
              className="hover:text-ink-900 transition-colors underline-grow"
            >
              About
            </a>
            <a
              href="#"
              className="hover:text-ink-900 transition-colors underline-grow"
            >
              Vision
            </a>
            <a
              href="#"
              className="hover:text-ink-900 transition-colors underline-grow"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
