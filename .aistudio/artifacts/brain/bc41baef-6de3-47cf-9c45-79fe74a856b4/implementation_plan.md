# Fullscreen Lightbox Gallery with Vertical Thumbnail Drawer & Autoplay

An advanced, responsive, high-performance media viewer modeled directly after your reference gallery (e.g. CosplayTele / LightGallery / PhotoSwipe), fully integrated with your Notion CMS images and videos.

## User Review & Confirmed Decisions

> [!IMPORTANT]
> Based on your design reference and confirmed preferences:
> - **Accurate Industry Terminology**: This feature is officially known as a **Fullscreen Lightbox Gallery Modal with Thumbnail Drawer, Slideshow Autoplay, and Deep Zoom / Pan** (commonly built with patterns from *PhotoSwipe* or *lightGallery*).
> - **Full Notion Compatibility**: 100% compatible with Notion image blocks (`file.url` AWS S3 signed URLs and `external.url`) and database media properties.
> - **Thumbnail Panel Layout**: Implemented as a **collapsible vertical right-hand sidebar drawer** with active item red-border highlight and automatic scroll-into-view, matching the reference screenshot.
> - **Controls & Toolbar**:
>   - Index Counter: `[current] / [total]` (e.g., `9 / 95`)
>   - Deep Zoom & Pan tool with click/pinch scaling
>   - Autoplay / Slideshow toggle button with play/pause state and configurable timer interval
>   - Thumbnail drawer toggle button (3x3 grid icon) to show/hide the right thumbnail drawer
>   - Previous / Next arrow navigation chevrons + keyboard bindings (`ArrowLeft`, `ArrowRight`, `Space` for play/pause, `Escape` to close)
>   - Fullscreen toggle and Close (`✕`) buttons

---

## 1. Overview & Architecture

### How It Works with Notion Content
1. **Dynamic Media Registry in Articles (`NotionBlockRenderer.jsx` & `ArticleDetail.jsx`)**:
   - As `NotionBlockRenderer` renders the post's blocks, all `image` blocks (and embedded image URLs) are automatically indexed into a sequential media list:
     ```js
     {
       index: 0,
       id: "block-id-1",
       src: "https://prod-files-secure.s3.us-west-2.amazonaws.com/...",
       alt: "Image caption or post title",
       caption: "Photo caption text"
     }
     ```
   - Each inline image in the article is wrapped with a responsive, subtle hover zoom effect and click handler: `onClick={() => openLightbox(index)}`.
2. **Global / Article Lightbox Component (`ImageLightboxModal.jsx`)**:
   - When opened, it mounts a high-performance modal portal at the `document.body` level.
   - Prevents background body scrolling (`overflow: hidden`).
   - Starts directly at the tapped image's index.
   - Displays the vertical right sidebar containing all post images with their thumbnail previews.

---

## 2. Visual Design & Layout (Matching Your Reference)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 9 / 95                                        [Zoom] [Play] [Grid] [Close]  │
├─────────────────────────────────────────────────────────────┬───────────────┤
│                                                             │ ┌───────────┐ │
│                                                             │ │  Thumb 1  │ │
│                                                             │ └───────────┘ │
│    [ < ]                 Main Image                 [ > ]   │ ┌───────────┐ │
│                                                             │ │  Thumb 2  │ │
│                                                             │ └───────────┘ │
│                                                             │ ┏━━━━━━━━━━━┓ │
│                                                             │ ┃  Active   ┃ │
│                                                             │ ┗━━━━━━━━━━━┛ │
│                                                             │ ┌───────────┐ │
│                                                             │ │  Thumb 4  │ │
│                                                             │ └───────────┘ │
├─────────────────────────────────────────────────────────────┴───────────────┤
│ Optional Caption / Title Bar                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### UI Features & Elements
- **Backdrop**: Deep translucent black backdrop (`bg-black/95 backdrop-blur-md`) providing cinematic focus.
- **Top Control Bar**:
  - Left: Image position counter (`9 / 95`) in crisp mono font.
  - Right: Action icon buttons with hover tooltips:
    - **Zoom**: Toggle between `contain` fit and `1.5x / 2.5x` deep zoom with drag-to-pan.
    - **Play/Pause**: Toggle 3.5s automated slideshow progression with subtle progress indicator.
    - **Grid / Drawer Icon**: Toggle visibility of the right-hand thumbnail sidebar drawer for distraction-free view.
    - **Close**: Quick dismiss with smooth fade-out.
- **Center Canvas**:
  - Smooth hardware-accelerated slide transitions (`opacity` and `transform`).
  - Left / Right chevron buttons with hover highlights.
  - Keyboard shortcuts: `ArrowLeft`, `ArrowRight`, `Space` (slideshow), `Escape` (close), `+` / `-` (zoom).
  - Touch swipe gestures for mobile and tablet screens.
- **Right Sidebar Drawer**:
  - 2-column or 1-column scrollable thumbnail gallery matching your screenshot.
  - Current image is highlighted with an active accent border (matching the red/pink border in your screenshot).
  - Automatically scrolls the active thumbnail into center view when navigating via arrow keys or autoplay.
  - Clicking any thumbnail instantly jumps the main stage to that photo.

---

## 3. Implementation Steps

1. **Create Lightbox Component (`src/components/ImageLightboxModal.jsx`)**:
   - Implements full state machine:
     - `currentIndex`
     - `isPlaying` (interval-based autoplay)
     - `isZoomed` and `zoomLevel`
     - `showThumbnails`
     - `panOffset` for zoomed image exploration
   - Manages keyboard listeners, body scroll lock, and touch swipe gestures.
   - Includes auto-scroll for the right-hand thumbnail list using `ref.scrollIntoView({ behavior: 'smooth', block: 'nearest' })`.

2. **Enhance `NotionBlockRenderer.jsx`**:
   - Collect and pass down image items to enable lightbox triggering on all article images.
   - Add hover zoom cursor (`cursor-zoom-in`) and click handler to all Notion image blocks.
   - Support caption display inside the lightbox when captions are present in Notion.

3. **Enhance `ArticleDetail.jsx`**:
   - Mount `ImageLightboxModal` whenever an image is selected.
   - Aggregate all images found in the article body + cover image into a cohesive gallery list.
   - Support optional gallery banner button: *"View All Photos in Gallery ([N])"* for posts containing photo sets.

4. **Testing & Verification**:
   - Verify keyboard navigation (`←`, `→`, `Esc`, `Space`).
   - Verify slideshow autoplay starts, cycles continuously, and pauses upon user interaction or toggle.
   - Verify zoom in/out and panning.
   - Verify right thumbnail drawer toggle and active thumbnail auto-scroll.
   - Verify mobile responsiveness on smaller viewports (drawer transitions gracefully to bottom filmstrip or overlay on very small mobile screens).

---

## 4. Verification & Validation Checklist

- [ ] Run `compile_applet` to ensure zero compilation or syntax errors.
- [ ] Test with sample Notion post containing multiple images.
- [ ] Verify image counter matches the total number of images (e.g. `1 / N`).
- [ ] Verify thumbnail drawer synchronizes selection bidirectionally.
