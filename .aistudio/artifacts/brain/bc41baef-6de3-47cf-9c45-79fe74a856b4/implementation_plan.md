# Global Password Protection Gate

A secure, session-isolated passkey gateway for the entire application that keeps all Notion CMS queries and child routes locked behind a password verification modal using pure in-memory state.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architecture choices have been confirmed based on your security and design preferences:

- **Secret Storage & Leak Prevention**: The passcode is stored exclusively in a server-side environment variable (`APP_PASSWORD`) in `.env`, verified via a lightweight `/api/verify-passcode` endpoint on the server. It is **never** bundled into client-side JavaScript or exposed in browser devtools.
- **Pure In-Memory Root State**: `App.jsx` initializes `const [isUnlocked, setIsUnlocked] = useState(false)`. No `localStorage` or `sessionStorage` is used, guaranteeing that any page reload immediately returns the app to its locked state.
- **Strict Content & Query Gating**: When `!isUnlocked`, child route rendering and Notion CMS API calls (`/api/posts`, `/api/post`, `/api/categories`) are completely prevented from executing.
- **Visual Harmony**: The lock screen inherits the exact squarish `rounded-3xl` container, warm pastel gradient (`#fff8dc` → `#ffc0db` → `#ffe3de`), backdrop blur (`bg-black/40 backdrop-blur-sm`), and `#ad103a` typography used by the existing footer modal.
- **Setup & Update Documentation**: A complete step-by-step guide is included for setting the initial password and updating it at any time in the future.

---

## 1. Overview & Core Concept

- **What It Does**: Presents a full-screen, focused password modal on entry. Entering the correct password unlocks the entire blog for the current session. Refreshing the browser instantly resets the lock.
- **Security Guarantee**: Because the verification runs against a server environment variable endpoint, the actual passcode is never transmitted to the browser bundle, can contain uppercase, lowercase, numbers, and symbols (`-_`), and can be updated anytime in `.env` without client code changes.
- **Key Value**: Protects private articles and personal notes with zero client-side credential leakage and zero residual storage across refreshes.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Initial Visit / Refresh**:
   - The user opens any URL (e.g. `/`, `/category/korean`, `/post/my-article`).
   - The root component mounts with `isUnlocked = false`.
   - Notion API queries and page routes remain suspended.
   - The user sees a centered frosted card floating above the softly blurred warm pastel backdrop.
2. **Passcode Input**:
   - The password field receives `autoFocus` immediately.
   - As the user types their passcode (supporting letters, numbers, and `-_`), masked bullets appear.
   - The user can press `Enter` or click the "Unlock" button.
3. **Verification**:
   - A brief loading pulse appears on the button.
   - **On Success**: Smooth fade transition; `isUnlocked` flips to `true`; child routes mount and fetch Notion data.
   - **On Failure**: A discreet shake animation and quiet error notice (`Incorrect passcode`) appears below the input, input clears and refocuses for the next attempt.

### Visual Styling & Tokens
- **Backdrop**: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200`
- **Modal Box**: `w-80 h-80 sm:w-96 sm:h-96 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/30 backdrop-blur-md`
- **Background Gradient**: `linear-gradient(to bottom right, #fff8dc, #ffc0db, #ffe3de)`
- **Header Badge & Label**: `font-korean text-xs uppercase tracking-widest text-[#ad103a]/70 font-semibold italic mb-2`
- **Title**: `text-xl sm:text-2xl font-bold text-[#ad103a] italic font-korean mb-4`
- **Input Styling**: Rounded-xl bordered field (`border-white/50 bg-white/70 focus:bg-white focus:border-[#ad103a]/50 text-ink-900 px-4 py-2 text-center text-base tracking-widest font-mono outline-none shadow-inner transition-all`)
- **Submit Button**: Rounded-xl action button (`bg-[#ad103a] hover:bg-[#8e0c2f] text-white px-5 py-2 font-medium text-sm transition-all shadow-md active:scale-95 cursor-pointer`)

---

## 3. First-Time Setup & Future Updates Guide

### A. How to Set Your Password for the First Time
1. Open the `.env` file in the root directory.
2. Add the variable:
   ```env
   APP_PASSWORD=YourPasswordHere_123
   ```
3. Your password can contain:
   - Uppercase & lowercase letters (`A-Z`, `a-z`)
   - Numbers (`0-9`)
   - Special characters `-` and `_`
4. The server also checks `.env.example` as a template reference (`APP_PASSWORD=`).
5. (Development Default): If `APP_PASSWORD` is not set yet in `.env`, a fallback development password (`dev-pass_123`) is supported so the app works immediately out of the box during testing.

### B. How to Update the Password in the Future
1. When you want to change your passcode, open `.env`.
2. Change the value:
   ```env
   APP_PASSWORD=NewSecretPasscode_2026
   ```
3. Restart or save the server process.
4. **No Code Rebuilding Needed**: Because verification happens dynamically on the server side, no frontend code rebuild or re-bundling is required. The browser will immediately test entries against your newly set password.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    App.jsx (Root)                      │  │
│  │                                                        │  │
│  │   isUnlocked === false            isUnlocked === true  │  │
│  │            │                               │           │  │
│  │            ▼                               ▼           │  │
│  │   ┌──────────────────┐           ┌──────────────────┐  │  │
│  │   │  LockScreenModal │           │  Router & Pages  │  │  │
│  │   │  (Frosted Glass) │           │  (Home, Article, │  │  │
│  │   └────────┬─────────┘           │   Category, etc.)│  │  │
│  │            │                     └────────┬─────────┘  │  │
│  └────────────┼──────────────────────────────┼────────────┘  │
│               │ POST /api/verify-passcode    │ GET /api/posts│
└───────────────┼──────────────────────────────┼───────────────┘
                ▼                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       Express Server                         │
│                                                              │
│  ┌──────────────────────────────┐  ┌──────────────────────┐  │
│  │ /api/verify-passcode         │  │ /api/posts, etc.     │  │
│  │ Compare req.body.password    │  │ Notion API           │  │
│  │ with process.env.APP_PASSWORD│  │ Integration          │  │
│  └──────────────────────────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Data Model & State
- **Root State (`App.jsx`)**:
  - `isUnlocked` (`boolean`, default: `false`): Governs whether the site view or the lock screen modal is mounted.
- **Lock Screen State (`LockScreen.jsx`)**:
  - `password` (`string`): Current input value.
  - `error` (`string | null`): Displays `"Incorrect passcode"` when validation fails.
  - `isChecking` (`boolean`): Loading spinner during endpoint submission.
- **Server Environment Variable**:
  - `APP_PASSWORD`: User-defined string in `.env`, supporting letters, numbers, and `-_`.

### Verification Sequence Flow
1. User enters password and presses Enter.
2. `LockScreen` sends `POST /api/verify-passcode` with `{ password }`.
3. Server compares the received password with `process.env.APP_PASSWORD`.
4. If valid, server responds `{ success: true }`.
5. Frontend sets `isUnlocked(true)`; `LockScreen` unmounts; `Router` mounts and children initiate Notion fetching.
6. If invalid, server responds `{ success: false, error: "Incorrect passcode" }` with 401 status. Frontend displays error indicator and shakes input.
