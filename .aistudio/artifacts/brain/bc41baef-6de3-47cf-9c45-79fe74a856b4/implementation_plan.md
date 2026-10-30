# Audio Playlist Streaming with Dreamy Theme Color Harmony & Persistent Track Naming

A persistent audio streaming system featuring circular `+` quick-add buttons on every audio file, a compact rounded playlist card positioned directly beneath the Table of Contents, HTML5 drag-and-drop queue reordering, infinite track looping, and dual-layer track naming (Notion caption fallback with in-app rename stored in `localStorage`).

All UI elements (buttons, icons, confirmation badges, queue items, and progress bars) are styled with dynamic color harmony matching the article's content text color in both Light Mode (`var(--article-text-color)`) and Dark Mode (`#9ffccb`).

## User Review & Confirmed Decisions

> [!IMPORTANT]
> Based on your confirmed choices & theme instructions:
> - **Dreamy Theme Color Harmony**:
>   - The circular `+` add button, added confirmation badge, playlist buttons (Play, Pause, Next, Prev, Loop), icons, and texts will dynamically match the **text content color** of the post.
>   - **Light Mode**: Uses the article's specific content color (`var(--article-text-color)` e.g. `#30a6a6`, `#d98079`, `#8a2be2`) with soft matching tinted borders and backgrounds.
>   - **Dark Mode**: Automatically harmonizes with the site's dark mode accent color (`#9ffccb` / `var(--theme-dark-text)`) and `#000000` pitch black container backgrounds.
> - **Track Naming Strategy**: Default to **Notion block caption** (or markdown link title). An in-app rename button (pencil icon) allows custom editing anytime, with names permanently stored in `localStorage` (`notion_audio_titles`) so they **never reset** across sessions or page refreshes.
> - **Persistent Global Audio Playback**: The playlist and audio player will be powered by a root-level `AudioPlaylistContext` so streaming **continues seamlessly across page navigation** throughout the blog.
> - **Queue Management**:
>   - Circular `+` button with rounded border next to every uploaded audio block/file in the post.
>   - Compact rounded playlist card placed directly under the Table of Contents (both Desktop sticky sidebar and Mobile collapsible section).
>   - **Drag-and-Drop Reordering**: Grab and reorder tracks directly in the queue using native HTML5 drag-and-drop.
>   - **Scrollable Track List**: Scrollable container matching the Table of Contents max-height styling when multiple songs are queued.
>   - **Playback Controls**: Play/Pause, Previous Track (`⏮`), Next Track (`⏭`), Seek scrubber, and **Infinite Loop Toggle (`🔂` Loop Current File Infinitely)**.

---

## 1. Technical Architecture & State Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.jsx (Root)                                  │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  AudioPlaylistProvider (Global Context & Persistent Audio Tag) │   │
│   │   - queue: [ { id, url, title, duration } ]                    │   │
│   │   - currentIndex: number                                       │   │
│   │   - isPlaying: boolean                                         │   │
│   │   - isLoopingCurrent: boolean                                  │   │
│   │   - customTitles: { [url]: string } (localStorage)             │   │
│   └──────────────────────┬───────────────────────┬─────────────────┘   │
│                          │                       │                     │
│                          ▼                       ▼                     │
│         NotionBlockRenderer.jsx             TableOfContents / Sidebar │
│     ┌──────────────────────────────┐        ┌─────────────────────────┐│
│     │ AudioPlayerBlock             │        │ AudioPlaylistCard       ││
│     │ - Notion Caption or Custom   │        │ - Current track & art   ││
│     │ - Circular (+) Add Button    │───────▶│ - Prev / Play / Next    ││
│     │ - Inline Rename Pencil       │        │ - [🔂] Loop Infinitely  ││
│     │ - Matched Theme Text Color   │        │ - Drag-and-drop list    ││
│     └──────────────────────────────┘        │ - Matched Theme Colors  ││
│                                             └─────────────────────────┘│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dreamy Theme Color System (Light & Dark Mode)

To ensure seamless aesthetic harmony with the blog's dreamy aesthetic:
- **Button Borders & Accents**: Styled using `currentColor` and `border-current`, inheriting the exact text color of the article.
- **Confirmation Feedback**: When an audio track is added, a subtle badge appears with `✓ Added` utilizing the article's text color and a delicate matching background tint.
- **Controls & Icons**: Play/Pause, Next/Previous, and Infinite Loop icons adapt dynamically:
  - In **Light Mode**: Tinted to the article's content text color (`var(--article-text-color)`).
  - In **Dark Mode**: Automatically transitions to the dreamy mint neon `#9ffccb` with pitch-black translucent backdrop (`bg-black/75`).

---

## 3. Audio Track Naming & Persistence Strategy

### How Track Names are Resolved:
1. **Priority 1 (`localStorage`)**: Custom title entered by the user via the in-app edit pencil icon (`notion_audio_custom_titles[url]`).
2. **Priority 2 (Notion API Caption)**: Any caption entered under the audio block in Notion (`block.audio.caption`).
3. **Priority 3 (File Name)**: Original file name if block is a Notion `file` block (`block.file.name`).
4. **Priority 4 (Fallback)**: Clean derived name (e.g. `Track #1 (Audio)`).

### How to Name Audio Files Directly in Notion:
- When you upload an audio file in Notion, hover over the player block and click **Caption** (or press `Alt + Enter`). Type the song title and artist (e.g., *“Stay With Me - Miki Matsubara”*). Notion's API automatically delivers this string with the block.

---

## 4. UI & Visual Specifications

### A. Inline Audio Player (`NotionBlockRenderer.jsx`)
- Circular `+` button (`w-8 h-8 rounded-full border border-current text-inherit hover:opacity-80 flex items-center justify-center transition-all`).
- When clicked, adds track to the queue and displays a synchronized confirmation badge (`✓ Added to playlist`).
- Inline rename pencil button allowing instant title edits saved to `localStorage`.

### B. Playlist Card (Under Table of Contents)
- **Container**: `rounded-2xl border border-current/25 bg-cream/80 dark:bg-black/60 backdrop-blur-md p-4 shadow-card mt-5`.
- **Now Playing Display**:
  - Animated soundwave / vinyl icon styled in theme color.
  - Track Title (click to edit).
  - Time elapsed / total duration with scrub slider tinted to theme color.
- **Controls Row**:
  - Previous (`⏮`), Play/Pause (`▶` / `⏸`), Next (`⏭`) in theme color.
  - Loop Infinite button (`🔂` with active ring indicator matching theme color).
  - Clear Queue button (`🗑`).
- **Drag-and-Drop Queue**:
  - Each item features a drag handle (`⠿`), track index, title, and remove button (`✕`).
  - Dragging over another item reorders the queue smoothly.
  - Scrollable up to 240px height with the custom scrollbar.

---

## 5. Implementation Steps

1. **Create `src/context/AudioPlaylistContext.jsx`**:
   - Manages single persistent HTML5 `<audio>` element.
   - Syncs queue, active track, volume, and `isLoopingCurrent` state.
   - Saves queue and custom titles to `localStorage`.
   - Exposes `addToQueue(track)`, `removeFromQueue(index)`, `reorderQueue(startIndex, endIndex)`, `playTrack(index)`, `togglePlay()`, `toggleLoop()`, and `renameTrack(url, newTitle)`.

2. **Wrap Root in `App.jsx`**:
   - Wrap the router and route components inside `<AudioPlaylistProvider>`.

3. **Update `AudioPlayerBlock` in `NotionBlockRenderer.jsx`**:
   - Add circular `+` button styled in `text-inherit border-current`.
   - Add inline title rename support with `localStorage` persistence.
   - Render `✓ Added` feedback in theme color.
   - Support Notion audio captions and markdown audio links.

4. **Create `src/components/AudioPlaylistCard.jsx`**:
   - Compact rounded card with drag-and-drop queue reordering (`onDragStart`, `onDragOver`, `onDrop`).
   - Integrated playback controls (Prev, Next, Play/Pause, Loop 1 Infinitely) all adopting theme text colors in light & dark mode.
   - Scrollable track list.

5. **Mount under Table of Contents in `ArticleDetail.jsx`**:
   - Mount `<AudioPlaylistCard />` directly beneath `<TableOfContents />` in both Desktop sticky sidebar and Mobile sections.

6. **Verification & Testing**:
   - Test adding audio files to the queue via the circular `+` button.
   - Test drag-and-drop reordering.
   - Test infinite single-track loop (`isLoopingCurrent`).
   - Test renaming a track and reloading the page to confirm local storage persistence.
   - Test color adaptation in both light mode and dark mode.
   - Run `lint_applet` and `compile_applet`.
