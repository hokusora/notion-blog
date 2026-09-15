// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../services/contentful";

export default function Navbar({ theme = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch categories từ Contentful khi mount
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Điều khiển đóng mở tiểu mục trên Mobile
  const toggleDropdown = (menuName) => {
    if (activeDropdown === menuName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(menuName);
    }
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/10"
      style={{
        background: "rgba(181, 175, 190, 0.46)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-[68px]">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-2 h-2 rounded-full bg-mint-500 group-hover:scale-125 transition-transform duration-300" />
            <span
              className="font-serif text-[1.35rem] font-bold tracking-tight"
              style={{ color: theme.navLogoColor || "#d3602b" }}
            >
              Hoku Sol
            </span>
          </Link>

          {/* ── Desktop Navigation Links — Đã thêm font HakgyoNal và màu hex #cb5a65 ── */}
          <div className="hidden md:flex items-center gap-8">
            {categories.map((cat) => {
              const slug = cat.fields.slug;
              const title = cat.fields.title;
              return (
                <Link
                  key={cat.sys.id}
                  to={`/category/${slug}`}
                  className="text-[24px] font-medium font-['HakgyoNal'] transition-colors"
                  style={{ color: theme.navLinkColor || "#e46e7a" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color =
                      theme.navLinkHover || "#7b6dff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      theme.navLinkColor || "#e46e7a")
                  }
                >
                  {title}
                </Link>
              );
            })}
          </div>

          {/* ── Mobile Menu Toggle Button ── */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hover:opacity-70 focus:outline-none transition-opacity"
              style={{ color: theme.navLogoColor || "#1a1a2e" }}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Dropdown Menu — Đã áp dụng font HakgyoNal và màu hex #e46e7a cho tiêu đề ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-cream border-t border-ink-300/40 px-5 py-5 flex flex-col gap-2 shadow-lg">
          {categories.map((cat) => {
            const slug = cat.fields.slug;
            const title = cat.fields.title;

            return (
              <div key={cat.sys.id}>
                <button
                  onClick={() => toggleDropdown(slug)}
                  className="w-full text-left text-sm font-medium py-2 flex justify-between items-center font-['HakgyoNal'] text-[#e46e7a] hover:text-mint-600"
                >
                  <span>{title}</span>
                  <span className="text-xs">
                    {activeDropdown === slug ? "−" : "+"}
                  </span>
                </button>
                <div
                  className={`pl-4 flex flex-col gap-2 overflow-hidden transition-all duration-200 ${
                    activeDropdown === slug
                      ? "max-h-32 py-1 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <Link
                    to={`/category/${slug}`}
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-ink-500 hover:text-ink-900 py-1"
                  >
                    All {title}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
