/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        cream: "#f7d1fe", // Warm off-white – main background
        "cream-dark": "#a9f9f2", // Slightly deeper cream for section blocks

        // Mint / Teal brand accent (Sol's Korean signature colour)
        mint: {
          50: "#F0FAF7",
          100: "#D8F7EF", // Light hero tint
          200: "#A8ECD8",
          300: "#6DD9BE",
          400: "#38C4A4",
          500: "#1DAD8F", // Primary interactive accent
          600: "#178F75",
          700: "#10705B",
        },

        // Blush / Rose for tags, secondary badges
        blush: {
          50: "#FEF4F3",
          100: "#F7D9D8",
          200: "#F0AFAC",
          300: "#E58582",
        },

        // Editorial neutrals
        ink: {
          900: "#0F172A", // Headings – near-black
          800: "#1E293B", // Subheadings
          700: "#334155", // Body text
          500: "#64748B", // Muted / metadata
          300: "#CBD5E1", // Dividers
          100: "#F1F5F9", // Ghost backgrounds
        },
      },

      // ── THÊM ĐOẠN NÀY NGAY DƯỚI HOẶC NGANG HÀNG VỚI COLORS ──
      backgroundImage: {
        "blog-gradient":
          "linear-gradient(to bottom right, #fff8dc, #ffc0db, #ffe3de)",
      },

      // ── Font families — tên khớp với @font-face trong index.css ──
      fontFamily: {
        serif: ["Angel", "Georgia", "serif"], // titles, headings
        sans: ["HakgyoNal", "system-ui", "sans-serif"], // body, UI
        monday: ["Monday", "sans-serif"], // dùng bằng class font-monday
        momosignature: ["MomoSignature", "sans-serif"], // ← thêm dòng này
        mono: ["'JetBrains Mono'", "monospace"],
      },

      fontSize: {
        "display-xl": [
          "clamp(2.5rem, 5vw, 4rem)",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "display-lg": [
          "clamp(2rem, 4vw, 3rem)",
          { lineHeight: "1.15", letterSpacing: "-0.015em" },
        ],
      },
      letterSpacing: {
        "ultra-wide": "0.2em",
        tag: "0.12em",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 4px 0 rgba(15,23,42,0.06), 0 4px 24px 0 rgba(15,23,42,0.04)",
        "card-lg": "0 8px 40px 0 rgba(15,23,42,0.10)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      scale: {
        103: "1.03",
      },
    },
  },
  plugins: [],
};
