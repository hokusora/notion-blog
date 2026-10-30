// Regex patterns for media file classification
const AUDIO_EXT_REGEX = /\.(mp3|wav|m4a|aac|ogg)(\?.*)?$/i;
const VIDEO_EXT_REGEX = /\.(mp4|webm|mov|mkv)(\?.*)?$/i;
const IMAGE_EXT_REGEX = /\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/i;

/**
 * Scan Notion blocks and markdown content strictly for current page content media.
 * - Excludes the hero / cover image.
 * - Excludes child_page blocks (no recursive scanning into sub-posts).
 * - Categorizes items into images, videos, and audios.
 */
export function extractPageContentMedia(blocks = [], content = "") {
  const seenUrls = new Set();
  const mediaItems = [];

  const addMedia = (url, type, label = "") => {
    if (!url || typeof url !== "string") return;
    const cleanUrl = url.trim();
    if (!cleanUrl || seenUrls.has(cleanUrl)) return;
    seenUrls.add(cleanUrl);
    mediaItems.push({
      url: cleanUrl,
      type,
      label: label || type,
    });
  };

  // 1. Scan Notion blocks (do NOT enter child_page blocks)
  if (Array.isArray(blocks)) {
    const walk = (items) => {
      if (!Array.isArray(items)) return;
      for (const block of items) {
        if (!block || !block.type) continue;

        // Skip child posts completely (non-recursive)
        if (block.type === "child_page") {
          continue;
        }

        // Image block
        if (block.type === "image") {
          const url = block.image?.file?.url || block.image?.external?.url;
          const caption =
            block.image?.caption?.map((c) => c.plain_text || c.text?.content || "").join("") || "";
          if (url) {
            addMedia(url, "image", caption || "Image");
          }
        }

        // Video block
        else if (block.type === "video") {
          const url = block.video?.file?.url || block.video?.external?.url;
          if (url) {
            addMedia(url, "video", "Video");
          }
        }

        // Audio block
        else if (block.type === "audio") {
          const url = block.audio?.file?.url || block.audio?.external?.url;
          if (url) {
            addMedia(url, "audio", "Audio track");
          }
        }

        // File block (detect if audio, video, or image)
        else if (block.type === "file") {
          const url = block.file?.file?.url || block.file?.external?.url;
          const name = block.file?.name || "";
          if (url) {
            if (AUDIO_EXT_REGEX.test(url) || AUDIO_EXT_REGEX.test(name)) {
              addMedia(url, "audio", name || "Audio file");
            } else if (VIDEO_EXT_REGEX.test(url) || VIDEO_EXT_REGEX.test(name)) {
              addMedia(url, "video", name || "Video file");
            } else if (IMAGE_EXT_REGEX.test(url) || IMAGE_EXT_REGEX.test(name)) {
              addMedia(url, "image", name || "Image file");
            }
          }
        }

        // Callouts, quotes, toggles, lists: recurse into children if present
        if (block.children && Array.isArray(block.children)) {
          walk(block.children);
        }
      }
    };

    walk(blocks);
  }

  // 2. Scan Markdown string if present
  if (typeof content === "string" && content.trim().length > 0) {
    // Markdown images: ![alt](url)
    const mdImgRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gi;
    let match;
    while ((match = mdImgRegex.exec(content)) !== null) {
      addMedia(match[2], "image", match[1] || "Image");
    }

    // Markdown links with media extensions: [label](url)
    const mdLinkRegex = /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gi;
    while ((match = mdLinkRegex.exec(content)) !== null) {
      const label = match[1] || "";
      const url = match[2];
      if (AUDIO_EXT_REGEX.test(url)) {
        addMedia(url, "audio", label || "Audio");
      } else if (VIDEO_EXT_REGEX.test(url)) {
        addMedia(url, "video", label || "Video");
      } else if (IMAGE_EXT_REGEX.test(url)) {
        addMedia(url, "image", label || "Image");
      }
    }
  }

  const images = mediaItems.filter((m) => m.type === "image");
  const videos = mediaItems.filter((m) => m.type === "video");
  const audios = mediaItems.filter((m) => m.type === "audio");

  return {
    items: mediaItems,
    images,
    videos,
    audios,
    totalCount: mediaItems.length,
    urls: mediaItems.map((m) => m.url),
  };
}

/**
 * Convert bytes into human-readable format: B, KB, MB, GB.
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes <= 0 || isNaN(bytes)) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, idx)).toFixed(dm))} ${sizes[idx]}`;
}
