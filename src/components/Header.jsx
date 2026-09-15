import { Link } from "react-router-dom";

// ============================================================
// HEADER — Compact site header used by App.jsx for the
// article detail route. Logic and Link unchanged.
// ============================================================

const Header = () => {
  return (
    <header className="bg-cream/90 backdrop-blur-md border-b border-ink-300/40 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 h-[64px] flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-2 h-2 rounded-full bg-mint-500 group-hover:scale-125 transition-transform duration-300" />
          <span className="font-serif text-[1.3rem] font-bold text-ink-900 tracking-tight">
            Hoku Sol
          </span>
        </Link>

        {/* Single nav link */}
        <nav>
          <Link
            to="/"
            className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors underline-grow py-1"
          >
            Articles
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
