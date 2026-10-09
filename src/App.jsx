import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ArticleDetail from "./pages/ArticleDetail";
import CategoryPage from "./pages/CategoryPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LockScreen from "./components/LockScreen";

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
      <Footer />
    </div>
  );
}

function App() {
  // Pure in-memory access state — resets to false strictly on every page refresh
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Conditionally block all routes, components, and data fetching until unlocked
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-blog-gradient text-ink-700 font-sans flex items-center justify-center relative overflow-hidden">
        <LockScreen onUnlock={() => setIsUnlocked(true)} />
      </div>
    );
  }

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
