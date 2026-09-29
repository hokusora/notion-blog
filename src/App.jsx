import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ArticleDetail from "./pages/ArticleDetail";
import CategoryPage from "./pages/CategoryPage";
import Header from "./components/Header";

// ============================================================
// APP — Router + layout shell.
// Home và CategoryPage tự render Navbar + footer bên trong.
// Header dùng riêng cho article detail route.
// ============================================================

function ArticleLayout() {
  return (
    <div className="min-h-screen bg-blog-gradient text-ink-700 font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
        <ArticleDetail />
      </main>
      <footer
        className="border-t border-white/10"
        style={{
          background: "rgba(175, 116, 116, 0.13)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
        }}
      >
        <div
          className="max-w-5xl mx-auto px-5 sm:px-8 py-8
                        flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} Hoku Sol. Crafted with care.
          </p>
          <div className="flex gap-5 text-xs text-ink-500">
            <a
              href="#"
              className="hover:text-ink-900 transition-colors underline-grow"
            >
              Privacy
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

function App() {
  return (
    <Router>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />

        {/* Category page: /category/korean, /category/japanese, etc. */}
        <Route path="/category/:categorySlug" element={<CategoryPage />} />

        {/* Article detail: support nested sub-paths like /post/parent/child/... */}
        <Route path="/post/:slug/*" element={<ArticleLayout />} />
        <Route path="/post/:slug" element={<ArticleLayout />} />

        {/* Article detail: support category + nested sub-paths e.g. /:categorySlug/:slug/* */}
        <Route path="/:categorySlug/:slug/*" element={<ArticleLayout />} />
        <Route path="/:categorySlug/:slug" element={<ArticleLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
