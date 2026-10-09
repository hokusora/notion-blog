import { useState, useRef, useEffect } from "react";

// Native Web Crypto API SHA-256 helper for browser-side verification fallback
async function sha256(message) {
  if (!window.crypto?.subtle) return "";
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function LockScreen({ onUnlock }) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Ensure autofocus on initial mount
    inputRef.current?.focus();
  }, []);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim() || isVerifying) return;

    setIsVerifying(true);
    setError("");

    try {
      // 1. Primary: Server-side verification to keep secret safe & leak-free
      const response = await fetch("/api/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passcode.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onUnlock();
          return;
        }
      }

      // If server rejected with 401
      if (response.status === 401) {
        setError("Incorrect passcode");
        triggerShake();
        setPasscode("");
        inputRef.current?.focus();
        return;
      }

      // 2. Client-side Web Crypto fallback if server is unreachable or offline preview
      const envHash = import.meta.env.VITE_APP_PASSWORD_HASH;
      if (envHash) {
        const inputHash = await sha256(passcode.trim());
        if (inputHash === envHash) {
          onUnlock();
          return;
        }
      }

      setError("Incorrect passcode");
      triggerShake();
      setPasscode("");
      inputRef.current?.focus();
    } catch {
      // If network fails (e.g. offline preview), check Web Crypto hash if configured
      try {
        const envHash = import.meta.env.VITE_APP_PASSWORD_HASH;
        if (envHash) {
          const inputHash = await sha256(passcode.trim());
          if (inputHash === envHash) {
            onUnlock();
            return;
          }
        }
      } catch (err) {
        console.error("Crypto verification fallback failed:", err);
      }

      setError("Incorrect passcode");
      triggerShake();
      setPasscode("");
      inputRef.current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Passcode Protected"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
    >
      {/* Softly rounded squarish modal container matching Footer popup */}
      <div
        style={{
          background:
            "linear-gradient(to bottom right, #fff8dc, #ffc0db, #ffe3de)",
        }}
        className={`w-80 h-80 sm:w-96 sm:h-96 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/30 backdrop-blur-md bg-blog-gradient transition-transform ${
          isShaking ? "animate-shake" : ""
        }`}
      >
        {/* Modal title & subtitle styled with exact font-korean + #ad103a accents */}
        <div className="font-korean px-2 max-w-full italic flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-[#ad103a]/70 block mb-2 font-semibold italic">
            Private Access
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#ad103a] leading-tight mb-4 italic">
            Enter Passcode
          </h2>
        </div>

        {/* Passcode input form with Enter key submission & autoFocus */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center"
        >
          <input
            ref={inputRef}
            type="password"
            autoFocus
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              if (error) setError("");
            }}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-64 max-w-full px-4 py-2.5 rounded-2xl border border-white/60 bg-white/75 focus:bg-white focus:border-[#ad103a]/60 text-ink-900 placeholder:text-ink-400 text-center text-base font-sans tracking-widest outline-none shadow-inner transition-all duration-150"
          />

          {/* Discreet error feedback on failure */}
          {error && (
            <p className="text-xs font-semibold text-[#ad103a] mt-2 italic font-korean animate-in fade-in">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isVerifying || !passcode}
            className="w-64 max-w-full mt-3.5 py-2 px-5 rounded-2xl bg-[#ad103a] hover:bg-[#8e0c2f] disabled:opacity-50 text-white font-sans text-sm font-semibold tracking-wide shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Verifying...</span>
              </span>
            ) : (
              "Unlock"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
