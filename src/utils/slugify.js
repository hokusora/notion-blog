/**
 * Robust slugify utility:
 * - Safely normalizes strings (NFC)
 * - Strips illegal URL characters (?, &, #, /, \, :, ;, @, =, +, $, %, etc.)
 * - Replaces whitespace, slashes, and colons with hyphens
 * - Collapses multiple hyphens into single hyphen
 * - CRUCIAL: Preserves CJK (Japanese Kanji/Kana, Korean Hangul) and international Unicode characters
 */
export function slugify(text) {
  if (!text) return "";
  return String(text)
    .trim()
    .normalize("NFC")
    .toLowerCase()
    // Replace colons, forward slashes, backslashes, underscores with hyphens
    .replace(/[:/\\_]+/g, "-")
    // Strip illegal URL characters: ? & # = + $ % " ' ` ! , ( ) [ ] { } * ^ ~ < > | . ; @
    .replace(/[?&#=+$%"'`!,()[\]{}*^~<>|.;@]/g, "")
    // Replace whitespace characters with hyphens
    .replace(/\s+/g, "-")
    // Collapse consecutive hyphens into a single hyphen
    .replace(/-+/g, "-")
    // Trim leading and trailing hyphens
    .replace(/^-+|-+$/g, "");
}

/**
 * Case-insensitive, Unicode-aware comparison for matching URL slugs with Notion titles or IDs
 */
export function slugsMatch(a, b) {
  if (!a || !b) return false;
  const strA = String(a).trim();
  const strB = String(b).trim();
  if (strA === strB) return true;

  try {
    const decodedA = decodeURIComponent(strA).toLowerCase();
    const decodedB = decodeURIComponent(strB).toLowerCase();
    if (decodedA === decodedB) return true;

    const slugA = slugify(decodedA);
    const slugB = slugify(decodedB);
    if (slugA && slugB && slugA === slugB) return true;
  } catch {
    // Fallback if decodeURIComponent fails on malformed input
    const slugA = slugify(strA);
    const slugB = slugify(strB);
    if (slugA && slugB && slugA === slugB) return true;
  }

  return false;
}

/**
 * Convert heading text to a clean URL-friendly slug
 */
export function slugifyHeading(text) {
  if (!text) return "section";
  return slugify(text) || "section";
}

/**
 * Parses markdown string and extracts all h2 and h3 headings with unique IDs
 */
export function parseHeadingsFromMarkdown(markdownText) {
  if (typeof markdownText !== "string" || !markdownText.trim()) {
    return [];
  }

  const lines = markdownText.split("\n");
  const headings = [];
  const usedSlugs = new Map();

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length; // 2 or 3
      const rawText = match[2]
        .replace(/[*_~`]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .trim();

      if (!rawText) continue;

      const baseSlug = slugifyHeading(rawText);
      const count = usedSlugs.get(baseSlug) || 0;
      const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;
      usedSlugs.set(baseSlug, count + 1);

      headings.push({
        id,
        text: rawText,
        level,
      });
    }
  }

  return headings;
}

/**
 * Parses Notion blocks and extracts all h2 and h3 headings with unique IDs
 */
export function parseHeadingsFromBlocks(blocks) {
  if (!blocks || !Array.isArray(blocks)) return [];

  const headings = [];
  const usedSlugs = new Map();

  for (const block of blocks) {
    if (block.type === "heading_2" || block.type === "heading_3") {
      const level = block.type === "heading_2" ? 2 : 3;
      const richText =
        block.type === "heading_2"
          ? block.heading_2?.rich_text
          : block.heading_3?.rich_text;
      const rawText = (richText || [])
        .map((t) => t.plain_text || t.text?.content || "")
        .join("")
        .trim();

      if (!rawText) continue;

      const baseSlug = slugifyHeading(rawText);
      const count = usedSlugs.get(baseSlug) || 0;
      const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;
      usedSlugs.set(baseSlug, count + 1);

      headings.push({
        id,
        text: rawText,
        level,
      });
    }
  }

  return headings;
}

/**
 * Universal helper to extract headings from either blocks or markdown
 */
export function parseHeadings(content, blocks) {
  if (blocks && Array.isArray(blocks) && blocks.length > 0) {
    const fromBlocks = parseHeadingsFromBlocks(blocks);
    if (fromBlocks.length > 0) return fromBlocks;
  }
  return parseHeadingsFromMarkdown(content);
}
