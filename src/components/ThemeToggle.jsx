import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDark(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("theme-change", handleThemeChange);
    window.addEventListener("storage", handleThemeChange);
    return () => {
      window.removeEventListener("theme-change", handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    if (nextIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    window.dispatchEvent(new Event("theme-change"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-toggle-btn rounded-full p-2 w-10 h-10 flex items-center justify-center transition-all shadow-sm hover:scale-105 cursor-pointer border border-white/30 shrink-0"
      style={{
        background:
          "linear-gradient(to bottom right, #fff8dc, #ffc0db, #ffe3de)",
      }}
    >
      {isDark ? (
        /* Sun Icon for Dark Mode */
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#9ffccb"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="1" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        /* Moon Icon for Light Mode */
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#9ffccb"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
