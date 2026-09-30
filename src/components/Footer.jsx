import { useState, useEffect } from "react";

const MODAL_CONTENT = {
  Individuality: {
    title: "Individuality",
    content: "Hoang Khuong (hokusol) 🌌🌠❄️",
    isPersonalInfo: false,
  },
  Vision: {
    title: "Vision",
    content: "mac pro, yamaha, ssd samsung, sony camera",
    isPersonalInfo: false,
  },
  "Personal Info": {
    title: "Personal Info",
    email: "hoangkhuong2146@gmail.com",
    github: "https://github.com/hokusora?tab=repositories",
    isPersonalInfo: true,
  },
};

// Aliases for compatibility
MODAL_CONTENT.About = MODAL_CONTENT.Individuality;
MODAL_CONTENT.Myself = MODAL_CONTENT.Individuality;
MODAL_CONTENT.Contact = MODAL_CONTENT["Personal Info"];
MODAL_CONTENT["renkaku shiyo"] = MODAL_CONTENT["Personal Info"];

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveModal(null);
      }
    };
    if (activeModal) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeModal]);

  const closeModal = () => setActiveModal(null);

  const activeData = activeModal ? MODAL_CONTENT[activeModal] : null;

  return (
    <>
      <footer
        className="border-t border-white/10 mt-16"
        style={{
          background: "rgba(234, 228, 228, 0.51)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-500" />
            <span className="font-serif text-base font-bold text-ink-900 tracking-tight">
              Hoku Sol
            </span>
          </div>

          <p className="text-xs text-ink-500 order-last md:order-none">
            © {new Date().getFullYear()} Hoku Sol. All rights reserved.
          </p>

          {/* Footer links */}
          <div className="flex gap-6 text-xs text-ink-500">
            <button
              type="button"
              onClick={() => setActiveModal("Individuality")}
              className="hover:text-ink-900 transition-colors underline-grow cursor-pointer bg-transparent border-none p-0 text-base font-sans text-[#4e056e]"
            >
              Individuality
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("Vision")}
              className="hover:text-ink-900 transition-colors underline-grow cursor-pointer bg-transparent border-none p-0 text-base font-sans text-[#4e056e]"
            >
              Vision
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("Personal Info")}
              className="hover:text-ink-900 transition-colors underline-grow cursor-pointer bg-transparent border-none p-0 text-lg font-sans text-[#4e056e]"
            >
              Personal Info
            </button>
          </div>
        </div>
      </footer>

      {/* Centered Interactive Modal */}
      {activeModal && activeData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeData.title}
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        >
          {/* Softly rounded squarish modal container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(to bottom right, #fff8dc, #ffc0db, #ffe3de)",
            }}
            className="w-80 h-80 sm:w-96 sm:h-96 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/30 backdrop-blur-md bg-blog-gradient"
          >
            {/* Subtle top-right close button */}
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 rounded-full text-[#ad103a]/60 hover:text-[#ad103a] hover:bg-white/30 transition-all duration-200 cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal text styling & content */}
            <div className="font-korean px-4 max-w-full italic">
              <span className="text-xs uppercase tracking-widest text-[#ad103a]/70 block mb-3 font-semibold italic">
                {activeData.title}
              </span>

              {activeData.isPersonalInfo ? (
                <div className="flex flex-col items-center gap-2.5 italic">
                  <a
                    href={`mailto:${activeData.email}`}
                    className="text-base sm:text-lg font-bold text-[#ad103a] underline underline-offset-4 hover:opacity-80 transition-opacity break-all italic"
                  >
                    {activeData.email}
                  </a>
                  <a
                    href={activeData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base sm:text-lg font-bold text-[#ad103a] underline underline-offset-4 hover:opacity-80 transition-opacity italic"
                  >
                    github
                  </a>
                </div>
              ) : (
                <p className="text-lg sm:text-xl font-bold text-[#ad103a] leading-relaxed break-words italic">
                  {activeData.content}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
