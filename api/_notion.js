import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { MOCK_ARTICLES, MOCK_CATEGORIES, findMockArticleByPath } from "../src/services/mockData.js";
import { slugify, slugsMatch } from "../src/utils/slugify.js";

// Re-export slugify and slugsMatch for backward compatibility across modules
export { slugify, slugsMatch };

// Extract and format Notion UUID (handles URLs, ?v= params, 32-hex, or formatted UUIDs)
export function parseNotionId(input) {
  if (!input) return null;
  let str = String(input).trim();
  // Strip query string and fragment (e.g. ?v=... or #...)
  str = str.split("?")[0].split("#")[0].trim();

  // If it's a URL or contains slashes, take the last path segment
  if (str.includes("/")) {
    const parts = str.split("/").filter(Boolean);
    str = parts[parts.length - 1] || "";
  }

  // 1. Check if string already contains a formatted UUID (8-4-4-4-12 hex)
  const uuidMatch = str.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
  if (uuidMatch) {
    return uuidMatch[1].toLowerCase();
  }

  // 2. Check if there is a 32-hex string (e.g. at the end of a title-slug or raw)
  const hexMatch =
    str.match(/(?:^|[^a-f0-9])([a-f0-9]{32})(?:[^a-f0-9]|$)/i) ||
    str.match(/([a-f0-9]{32})$/i);
  if (hexMatch) {
    const h = hexMatch[1].toLowerCase();
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }

  // 3. Fallback: sanitize non-alphanumeric characters
  const fallback = str.replace(/[^a-zA-Z0-9-]/g, "");
  return fallback || null;
}

// Initialize Notion Client safely
export function getNotionClient() {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) return null;
  return new Client({ auth: apiKey });
}

export function getDatabaseId() {
  return parseNotionId(process.env.NOTION_DATABASE_ID);
}

// Helper for case-insensitive property lookup on Notion pages
export function getCaseInsensitiveProperty(properties, ...possibleNames) {
  if (!properties || typeof properties !== "object") return null;
  const lowerNames = possibleNames.map((n) => n.toLowerCase().trim());
  for (const [key, val] of Object.entries(properties)) {
    if (lowerNames.includes(key.toLowerCase().trim())) {
      return val;
    }
  }
  return null;
}

// Extract font-class from Notion page properties (Font, font, Language, language)
export function extractFontClass(props) {
  if (!props || typeof props !== "object") return "font-default";
  const fontProp = getCaseInsensitiveProperty(props, "Font", "font", "Language", "language");
  let rawVal = "";
  if (fontProp) {
    if (fontProp.select?.name) rawVal = fontProp.select.name;
    else if (fontProp.rich_text?.[0]?.plain_text) rawVal = fontProp.rich_text[0].plain_text;
    else if (fontProp.title?.[0]?.plain_text) rawVal = fontProp.title[0].plain_text;
    else if (typeof fontProp === "string") rawVal = fontProp;
  }

  if (!rawVal) {
    rawVal =
      props?.Font?.select?.name ||
      props?.font?.select?.name ||
      props?.Language?.select?.name ||
      props?.language?.select?.name ||
      props?.Font?.rich_text?.[0]?.plain_text ||
      props?.font?.rich_text?.[0]?.plain_text ||
      "";
  }

  const normalized = String(rawVal).toLowerCase().trim();
  if (normalized === "korean" || normalized.includes("korean") || normalized === "ko" || normalized === "kr" || normalized.includes("manito")) {
    return "font-korean";
  }
  if (normalized === "vietnamese" || normalized.includes("vietnamese") || normalized === "vi" || normalized === "vn" || normalized.includes("tieng viet") || normalized.includes("tiếng việt") || normalized.includes("angel")) {
    return "font-vietnamese";
  }
  if (normalized === "japanese" || normalized.includes("japanese") || normalized === "ja" || normalized === "jp" || normalized.includes("nihongo") || normalized.includes("mugimaru")) {
    return "font-japanese";
  }
  return "font-default";
}

// Extract and validate text color from Notion page properties (TextColor, textcolor, text_color, Color, color)
export function extractTextColor(props) {
  if (!props || typeof props !== "object") return "#30a6a6";
  const colorProp = getCaseInsensitiveProperty(props, "TextColor", "textcolor", "text_color", "text-color", "Color", "color");
  let rawVal = "";
  if (colorProp) {
    if (colorProp.rich_text?.[0]?.plain_text) rawVal = colorProp.rich_text[0].plain_text;
    else if (colorProp.select?.name) rawVal = colorProp.select.name;
    else if (colorProp.title?.[0]?.plain_text) rawVal = colorProp.title[0].plain_text;
    else if (typeof colorProp === "string") rawVal = colorProp;
  }

  if (!rawVal) {
    rawVal =
      props?.TextColor?.rich_text?.[0]?.plain_text ||
      props?.textcolor?.rich_text?.[0]?.plain_text ||
      props?.TextColor?.select?.name ||
      props?.textcolor?.select?.name ||
      props?.text_color?.rich_text?.[0]?.plain_text ||
      props?.text_color?.select?.name ||
      props?.Color?.rich_text?.[0]?.plain_text ||
      props?.Color?.select?.name ||
      "";
  }

  const trimmed = String(rawVal).trim();
  if (!trimmed) return "#30a6a6";

  // Validate if it starts with # or is a valid CSS color string (hex, rgb, rgba, hsl, hsla, or standard named color)
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
    return trimmed;
  }
  if (/^rgba?\s*\(.+\)$/i.test(trimmed) || /^hsla?\s*\(.+\)$/i.test(trimmed)) {
    return trimmed;
  }
  if (/^[a-zA-Z]+$/.test(trimmed)) {
    return trimmed;
  }
  return "#30a6a6";
}

// Map Notion page properties to the blog article schema
export function mapNotionPageToArticle(page, markdownContent = "") {
  const props = page.properties || {};

  // Multilingual Font & TextColor
  const fontClass = extractFontClass(props);
  const textColor = extractTextColor(props);

  // 1. Title property ("Title" or "Name")
  const titleList =
    props.Title?.title ||
    props.Name?.title ||
    props.Post?.title ||
    props.Article?.title ||
    [];
  const title =
    titleList.map((t) => t.plain_text).join("").trim() || "Untitled Article";

  // 2. Slug property ("Slug" or generated from title)
  const slugProp = props.Slug?.rich_text || props.Slug?.title || [];
  const slugText =
    slugProp.map((t) => t.plain_text).join("").trim() ||
    props.Slug?.formula?.string?.trim();
  const slug = slugText || slugify(title) || page.id;

  // 3. Category property ("Category" select or multi_select)
  const catName =
    props.Category?.select?.name ||
    props.Category?.multi_select?.[0]?.name ||
    props.Tags?.select?.name ||
    props.Category?.rich_text?.[0]?.plain_text ||
    "Korean";
  const catSlug = slugify(catName) || "korean";

  // 4. Published Date ("Date" or created_time)
  const dateVal =
    props.Date?.date?.start ||
    props["Published Date"]?.date?.start ||
    props.Published?.date?.start ||
    page.created_time ||
    new Date().toISOString();

  // 5. Excerpt / Summary ("Excerpt" or "Summary")
  const excerptList =
    props.Excerpt?.rich_text ||
    props.Summary?.rich_text ||
    props.Description?.rich_text ||
    [];
  const excerpt =
    excerptList.map((t) => t.plain_text).join("").trim() ||
    (markdownContent
      ? markdownContent
          .replace(/[#*`_>[\]()]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 160) + "..."
      : "");

  // 6. Tags
  const tagsList =
    props.Tags?.multi_select?.map((t) => t.name) || [catName.toUpperCase()];

  // 7. Cover Image ("Cover" property or page cover)
  let coverUrl = "";
  if (props.Cover?.files?.[0]) {
    coverUrl =
      props.Cover.files[0].file?.url ||
      props.Cover.files[0].external?.url ||
      "";
  } else if (props["Cover Image"]?.files?.[0]) {
    coverUrl =
      props["Cover Image"].files[0].file?.url ||
      props["Cover Image"].files[0].external?.url ||
      "";
  } else if (page.cover) {
    coverUrl = page.cover.external?.url || page.cover.file?.url || "";
  }

  // 8. S3 / attachment URL if available
  const s3Url =
    props["S3 URL"]?.url ||
    props.s3Url?.url ||
    props.Attachment?.files?.[0]?.file?.url ||
    props.Attachment?.files?.[0]?.external?.url ||
    null;

  return {
    sys: {
      id: page.id,
      createdAt: page.created_time,
    },
    fields: {
      title,
      slug,
      excerpt,
      date: dateVal,
      tags: tagsList,
      coverImage: coverUrl
        ? {
            fields: {
              file: {
                url: coverUrl,
              },
            },
          }
        : null,
      category: {
        fields: {
          title: catName,
          slug: catSlug,
        },
      },
      fontClass,
      textColor,
      content: markdownContent || "",
      s3Url,
    },
  };
}

// Helper to check whether a Notion page is published
export function isPagePublished(page) {
  const props = page.properties || {};

  // Check Status property (Status or Select)
  const statusProp = props.Status || props.status || props.State || props.state;
  if (statusProp) {
    const val = statusProp.status?.name || statusProp.select?.name;
    if (val) {
      const lower = val.toLowerCase();
      return lower === "published" || lower === "done" || lower === "live";
    }
    if (statusProp.type === "checkbox") {
      return Boolean(statusProp.checkbox);
    }
  }

  // Check Published property (Checkbox, Status, or Select)
  const publishedProp = props.Published || props.published;
  if (publishedProp) {
    if (publishedProp.type === "checkbox") {
      return Boolean(publishedProp.checkbox);
    }
    const val = publishedProp.status?.name || publishedProp.select?.name;
    if (val) {
      return val.toLowerCase() === "published";
    }
  }

  // Default to true if no publish/status field is specified
  return true;
}

// In-memory cache for block children and resolved articles to keep child pages snappy.
// S3 expiring URL safeguard: Notion AWS S3 presigned URLs expire after 1 hour (X-Amz-Expires=3600).
// In development mode, cache TTL is set to 0 to bypass caching and enable live reload on browser refresh.
const isDev = process.env.NODE_ENV !== "production";
export const CACHE_TTL_MS = isDev ? 0 : 30 * 60 * 1000;
const blockChildrenCache = new Map();
const articleCache = new Map();
const pageMetadataCache = new Map();

export function clearNotionCaches() {
  blockChildrenCache.clear();
  articleCache.clear();
  pageMetadataCache.clear();
}

// Enrich child_page blocks with dedicated cover thumbnails, icons, and slugs
export async function enrichChildPageBlocks(notion, blocks) {
  if (!blocks || !Array.isArray(blocks)) return blocks;

  const childPageBlocks = blocks.filter((b) => b.type === "child_page");
  if (childPageBlocks.length === 0) return blocks;

  await Promise.all(
    childPageBlocks.map(async (block) => {
      if (!block.child_page) block.child_page = {};
      const title = block.child_page.title || "Sub-page";
      const blockId = parseNotionId(block.id);

      // 1. If running in mock / fallback mode without active Notion credentials
      if (!notion) {
        const mockMatch = MOCK_ARTICLES.find(
          (m) =>
            slugsMatch(m.fields.title, title) ||
            slugsMatch(m.fields.slug, title) ||
            m.sys?.id === block.id
        );
        if (mockMatch) {
          block.child_page.cover =
            mockMatch.fields.coverImage?.fields?.file?.url ||
            (typeof mockMatch.fields.coverImage === "string" ? mockMatch.fields.coverImage : null);
          block.child_page.icon = mockMatch.fields.icon || null;
          block.child_page.excerpt = mockMatch.fields.excerpt || "";
          block.child_page.slug = slugify(title);
          block.child_page.fontClass = mockMatch.fields.fontClass || "font-default";
          block.child_page.textColor = mockMatch.fields.textColor || "#30a6a6";
        }
        return;
      }

      // 2. Notion API mode: check pageMetadataCache
      if (blockId) {
        const cached = pageMetadataCache.get(blockId);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
          block.child_page.cover = cached.cover;
          block.child_page.icon = cached.icon;
          return;
        }

        try {
          let pageCover = null;
          let pageIcon = null;

          if (typeof notion.pages?.retrieve === "function") {
            const pageObj = await notion.pages.retrieve({ page_id: blockId });
            pageCover = pageObj?.cover?.external?.url || pageObj?.cover?.file?.url || null;
            pageIcon = pageObj?.icon?.emoji || pageObj?.icon?.file?.url || pageObj?.icon?.external?.url || null;
          }

          // Fallback: If no explicit page cover, check if first child block of that subpage is an image
          if (!pageCover && typeof notion.blocks?.children?.list === "function") {
            try {
              const childBlocks = await getBlockChildren(notion, blockId);
              const firstImg = childBlocks?.find((cb) => cb.type === "image");
              pageCover = firstImg?.image?.file?.url || firstImg?.image?.external?.url || null;
            } catch {
              // ignore
            }
          }

          block.child_page.cover = pageCover;
          block.child_page.icon = pageIcon;
          pageMetadataCache.set(blockId, {
            timestamp: Date.now(),
            cover: pageCover,
            icon: pageIcon,
          });
        } catch (err) {
          console.warn(`Could not enrich child_page block ${blockId}:`, err.message);
        }
      }
    })
  );

  return blocks;
}

// Fetch all child blocks for a given block or page ID with pagination and caching
export async function getBlockChildren(notion, blockId) {
  const cleanId = parseNotionId(blockId);
  if (!cleanId || !notion) return [];

  const cached = blockChildrenCache.get(cleanId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const allBlocks = [];
  let cursor = undefined;

  try {
    do {
      const response = await notion.blocks.children.list({
        block_id: cleanId,
        start_cursor: cursor,
        page_size: 100,
      });
      if (response?.results) {
        allBlocks.push(...response.results);
      }
      cursor = response?.has_more ? response.next_cursor : undefined;
    } while (cursor);

    blockChildrenCache.set(cleanId, { timestamp: Date.now(), data: allBlocks });
    return allBlocks;
  } catch (err) {
    console.error(`Error fetching child blocks for block ${cleanId}:`, err);
    return allBlocks;
  }
}

// Convert Notion page blocks to Markdown
export async function getPageMarkdown(pageId, preloadedBlocks = null) {
  const notion = getNotionClient();
  if (!notion) return "";
  const cleanPageId = parseNotionId(pageId);
  if (!cleanPageId) return "";

  try {
    const n2m = new NotionToMarkdown({ notionClient: notion });

    // Custom transformer for child_page blocks to render sub-page navigation callout
    n2m.setCustomTransformer("child_page", async (block) => {
      const title = block.child_page?.title || "Sub-page";
      const slug = slugify(title);
      return `\n\n[child_page:${title}](${slug})\n\n`;
    });

    // Custom transformer for Notion video blocks to output markdown links
    n2m.setCustomTransformer("video", async (block) => {
      const video = block.video;
      const url = video?.file?.url || video?.external?.url || "";
      if (!url) return "";
      return `\n\n[video](${url})\n\n`;
    });

    // Custom transformer for Notion file blocks
    n2m.setCustomTransformer("file", async (block) => {
      const file = block.file;
      const url = file?.file?.url || file?.external?.url || "";
      const name = file?.name || "file";
      if (!url) return "";
      return `\n\n[${name}](${url})\n\n`;
    });

    // Custom transformer for Notion pdf blocks
    n2m.setCustomTransformer("pdf", async (block) => {
      const pdf = block.pdf;
      const url = pdf?.file?.url || pdf?.external?.url || "";
      if (!url) return "";
      return `\n\n[document.pdf](${url})\n\n`;
    });

    // Custom transformer for Notion image blocks (strictly inline)
    n2m.setCustomTransformer("image", async (block) => {
      const image = block.image;
      const url = image?.file?.url || image?.external?.url || "";
      const caption = image?.caption?.[0]?.plain_text || "Post media";
      if (!url) return "";
      return `\n\n![${caption}](${url})\n\n`;
    });

    // Custom transformer for Notion embed blocks (e.g. video URLs)
    n2m.setCustomTransformer("embed", async (block) => {
      const embed = block.embed;
      const url = embed?.url || "";
      if (!url) return "";
      return `\n\n[video](${url})\n\n`;
    });

    let mdblocks;
    if (preloadedBlocks && Array.isArray(preloadedBlocks) && preloadedBlocks.length > 0) {
      mdblocks = await n2m.blocksToMarkdown(preloadedBlocks);
    } else {
      mdblocks = await n2m.pageToMarkdown(cleanPageId);
    }
    const mdString = n2m.toMarkdownString(mdblocks);
    return mdString?.parent || "";
  } catch (err) {
    console.error("Error converting Notion page to markdown:", err);
    return "";
  }
}

// Cached resolved data source ID to avoid redundant lookups
let cachedDataSourceId = null;

// Resolve any Notion database ID, page ID, or workspace data source ID to a valid queryable data_source_id
export async function resolveDataSourceId(notion, rawId) {
  if (cachedDataSourceId) return cachedDataSourceId;

  const cleanId = parseNotionId(rawId);

  // 1. Search for available data sources shared with this integration (Notion API 2025-09-03)
  if (typeof notion.search === "function") {
    try {
      const searchRes = await notion.search({
        filter: { value: "data_source", property: "object" },
      });
      const dataSources = searchRes?.results || [];

      if (dataSources.length > 0) {
        if (cleanId) {
          const match = dataSources.find((ds) => {
            const dsId = parseNotionId(ds.id);
            const parentDbId = parseNotionId(ds.parent?.database_id);
            const parentPageId = parseNotionId(ds.database_parent?.page_id);
            return cleanId === dsId || cleanId === parentDbId || cleanId === parentPageId;
          });
          if (match?.id) {
            cachedDataSourceId = parseNotionId(match.id);
            return cachedDataSourceId;
          }
        }

        // If no explicit match but only 1 data source exists in integration, use it
        if (dataSources[0]?.id) {
          cachedDataSourceId = parseNotionId(dataSources[0].id);
          return cachedDataSourceId;
        }
      }
    } catch {
      // Continue to direct inspection fallback
    }
  }

  if (!cleanId) return null;

  // 2. If cleanId is already a database, retrieve it to get its primary data source ID
  if (typeof notion.databases?.retrieve === "function") {
    try {
      const dbInfo = await notion.databases.retrieve({ database_id: cleanId });
      if (dbInfo?.data_sources && Array.isArray(dbInfo.data_sources) && dbInfo.data_sources.length > 0) {
        if (dbInfo.data_sources[0]?.id) {
          cachedDataSourceId = parseNotionId(dbInfo.data_sources[0].id) || cleanId;
          return cachedDataSourceId;
        }
      }
    } catch {
      // cleanId may be a parent page or direct data_source_id
    }
  }

  // 3. If cleanId is a page containing an inline child database, inspect child blocks
  if (typeof notion.blocks?.children?.list === "function") {
    try {
      const blocks = await notion.blocks.children.list({ block_id: cleanId });
      const childDb = blocks?.results?.find((b) => b.type === "child_database");
      if (childDb?.id) {
        const childDbId = parseNotionId(childDb.id);
        if (typeof notion.databases?.retrieve === "function") {
          try {
            const dbInfo = await notion.databases.retrieve({ database_id: childDbId });
            if (dbInfo?.data_sources?.[0]?.id) {
              cachedDataSourceId = parseNotionId(dbInfo.data_sources[0].id) || childDbId;
              return cachedDataSourceId;
            }
          } catch {
            // Use childDbId directly
          }
        }
        cachedDataSourceId = childDbId;
        return cachedDataSourceId;
      }
    } catch {
      // Continue with cleanId
    }
  }

  cachedDataSourceId = cleanId;
  return cleanId;
}

// Universal database query helper supporting @notionhq/client v5+ (dataSources/request) and older versions
export async function queryNotionDatabase(notion, rawDatabaseId, { filter, sorts } = {}) {
  const dataSourceId = await resolveDataSourceId(notion, rawDatabaseId);
  if (!dataSourceId) {
    throw new Error(`Unable to resolve Notion database or data source for ID: ${rawDatabaseId}`);
  }

  // 1. Try notion.dataSources?.query (Notion SDK v5+ / API 2025-09-03)
  if (typeof notion.dataSources?.query === "function") {
    const args = { data_source_id: dataSourceId };
    if (filter) args.filter = filter;
    if (sorts) args.sorts = sorts;
    return await notion.dataSources.query(args);
  }

  // 2. Fallback using notion.request for REST API compatibility (uses data_sources endpoint)
  if (typeof notion.request === "function") {
    const body = {};
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;

    return await notion.request({
      path: `data_sources/${dataSourceId}/query`,
      method: "post",
      body: Object.keys(body).length > 0 ? body : undefined,
    });
  }

  // 3. Fallback for legacy SDK
  if (typeof notion.databases?.query === "function") {
    const args = { database_id: dataSourceId };
    if (filter) args.filter = filter;
    if (sorts) args.sorts = sorts;
    return await notion.databases.query(args);
  }

  throw new Error("No compatible query method available on Notion client");
}

// Query Notion database for published articles with fallback
export async function getNotionArticles(categorySlug = null, options = {}) {
  const isDev = process.env.NODE_ENV !== "production";
  if (options?.refresh || isDev) {
    clearNotionCaches();
  }

  const notion = getNotionClient();
  const databaseId = getDatabaseId();

  if (!notion || !databaseId) {
    let results = MOCK_ARTICLES;
    if (categorySlug) {
      results = results.filter((item) => {
        const cat = item.fields.category;
        if (Array.isArray(cat)) {
          return cat.some((c) => c?.fields?.slug === categorySlug);
        }
        return cat?.fields?.slug === categorySlug;
      });
    }
    return results;
  }

  try {
    let response;
    try {
      response = await queryNotionDatabase(notion, databaseId);
    } catch (queryErr) {
      console.warn("Failed to query Notion database, falling back to mock data:", queryErr.message || queryErr);
      return MOCK_ARTICLES;
    }

    const pages = response?.results || [];
    if (pages.length === 0) {
      return MOCK_ARTICLES;
    }

    // Filter published pages safely in JS and map to article schema
    const publishedPages = pages.filter(isPagePublished);
    const validPages = publishedPages.length > 0 ? publishedPages : pages;

    const articles = validPages.map((page) => mapNotionPageToArticle(page, ""));

    // Sort by date desc
    articles.sort((a, b) => new Date(b.fields.date) - new Date(a.fields.date));

    if (categorySlug) {
      return articles.filter(
        (art) => art.fields.category?.fields?.slug === categorySlug
      );
    }

    return articles;
  } catch (err) {
    console.error("Error fetching Notion articles:", err);
    return MOCK_ARTICLES;
  }
}

// Get single article or nested child page by slug path including full page blocks & content
export async function getNotionArticleBySlug(slugOrPath, options = {}) {
  if (!slugOrPath) return null;
  const cleanPath = String(slugOrPath).trim().replace(/^\/+|\/+$/g, "");
  const segments = cleanPath.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const isDev = process.env.NODE_ENV !== "production";
  if (options?.refresh || isDev) {
    clearNotionCaches();
  }

  // Check in-memory article cache (bypassed in development or when refresh=true)
  if (!isDev && !options?.refresh && CACHE_TTL_MS > 0) {
    const cachedArticle = articleCache.get(cleanPath);
    if (cachedArticle && Date.now() - cachedArticle.timestamp < CACHE_TTL_MS) {
      return cachedArticle.data;
    }
  }

  const notion = getNotionClient();
  const databaseId = getDatabaseId();

  if (!notion || !databaseId) {
    return findMockArticleByPath(cleanPath);
  }

  try {
    let response;
    try {
      response = await queryNotionDatabase(notion, databaseId);
    } catch (innerErr) {
      console.warn(`Failed to query database for slug '${cleanPath}':`, innerErr.message || innerErr);
      return findMockArticleByPath(cleanPath);
    }

    const pages = response?.results || [];
    const rootSlug = segments[0];

    // Find parent root page
    let rootPage = pages.find((p) => {
      const art = mapNotionPageToArticle(p);
      return art.fields.slug === rootSlug;
    });

    if (!rootPage && pages.length > 0) {
      rootPage = pages.find((p) => {
        const art = mapNotionPageToArticle(p);
        return (
          slugify(art.fields.title) === rootSlug ||
          p.id === rootSlug ||
          parseNotionId(p.id) === parseNotionId(rootSlug)
        );
      });
    }

    if (!rootPage) {
      return findMockArticleByPath(cleanPath);
    }

    // Always fetch a fresh page object directly from Notion API to obtain newly generated AWS S3 signed URLs
    try {
      if (typeof notion.pages?.retrieve === "function") {
        const freshPage = await notion.pages.retrieve({ page_id: rootPage.id });
        if (freshPage && freshPage.id) {
          rootPage = freshPage;
        }
      }
    } catch (refreshErr) {
      console.warn(`Could not refresh root page ${rootPage.id}:`, refreshErr.message);
    }

    let rootBlocks = await getBlockChildren(notion, rootPage.id);
    rootBlocks = await enrichChildPageBlocks(notion, rootBlocks);
    const rootArticle = mapNotionPageToArticle(rootPage);
    rootArticle.fields.blocks = rootBlocks;

    // Independent root cover extraction:
    if (!rootArticle.fields.coverImage) {
      const pageCover = rootPage.cover?.external?.url || rootPage.cover?.file?.url || null;
      if (pageCover) {
        rootArticle.fields.coverImage = { fields: { file: { url: pageCover } } };
      } else {
        const firstImg = rootBlocks.find((b) => b.type === "image");
        const fallbackUrl = firstImg?.image?.file?.url || firstImg?.image?.external?.url || null;
        if (fallbackUrl) {
          rootArticle.fields.coverImage = { fields: { file: { url: fallbackUrl } } };
        }
      }
    }
    if (!rootArticle.fields.icon) {
      rootArticle.fields.icon = rootPage.icon?.emoji || rootPage.icon?.file?.url || rootPage.icon?.external?.url || null;
    }

    const catSlug = rootArticle.fields.category?.fields?.slug || "general";
    const catTitle = rootArticle.fields.category?.fields?.title || "Articles";

    // CASE 1: Single segment — return parent root page
    if (segments.length === 1) {
      const markdown = await getPageMarkdown(rootPage.id, rootBlocks);
      rootArticle.fields.content = markdown;
      rootArticle.fields.breadcrumbs = [
        { title: "Home", path: "/" },
        { title: catTitle, path: `/category/${catSlug}` },
        { title: rootArticle.fields.title, path: `/${catSlug}/${rootArticle.fields.slug}` },
      ];
      if (!isDev && CACHE_TTL_MS > 0) {
        articleCache.set(cleanPath, { timestamp: Date.now(), data: rootArticle });
      }
      return rootArticle;
    }

    // CASE 2: Multi-level recursive nested child page path (parent-slug/child-slug/grandchild-slug...)
    let currentBlockId = rootPage.id;
    let currentBlocks = rootBlocks;
    let currentTitle = rootArticle.fields.title;
    const breadcrumbs = [
      { title: "Home", path: "/" },
      { title: catTitle, path: `/category/${catSlug}` },
      { title: rootArticle.fields.title, path: `/${catSlug}/${rootArticle.fields.slug}` },
    ];
    let accumulatedPath = rootArticle.fields.slug || rootSlug;

    for (let i = 1; i < segments.length; i++) {
      const targetSegment = segments[i];

      // Inspect currentBlocks for a child_page block matching targetSegment (supports multiple siblings, CJK, IDs)
      const matchingChildPageBlock = currentBlocks.find((b) => {
        if (b.type !== "child_page" || !b.child_page?.title) return false;
        const pageTitle = b.child_page.title;
        const pageSlug = slugify(pageTitle);
        return (
          slugsMatch(pageSlug, targetSegment) ||
          slugsMatch(pageTitle, targetSegment) ||
          b.id === targetSegment ||
          parseNotionId(b.id) === parseNotionId(targetSegment) ||
          pageSlug.includes(slugify(targetSegment)) ||
          slugify(targetSegment).includes(pageSlug)
        );
      });

      if (!matchingChildPageBlock) {
        // Fallback to mock data if path exists in mocks
        const mockFallback = findMockArticleByPath(cleanPath);
        if (mockFallback) return mockFallback;
        return null;
      }

      currentBlockId = matchingChildPageBlock.id;
      currentTitle = matchingChildPageBlock.child_page.title;
      accumulatedPath += `/${slugify(currentTitle) || targetSegment}`;
      breadcrumbs.push({
        title: currentTitle,
        path: `/${catSlug}/${accumulatedPath}`,
      });

      // Fetch blocks for this child page and enrich its child blocks (supporting grandchild pages)
      currentBlocks = await getBlockChildren(notion, currentBlockId);
      currentBlocks = await enrichChildPageBlocks(notion, currentBlocks);
    }

    // 1. Retrieve the native Notion child page object to access page.cover and page.icon
    let childPageObj = null;
    try {
      if (typeof notion.pages?.retrieve === "function") {
        childPageObj = await notion.pages.retrieve({ page_id: currentBlockId });
      }
    } catch (retrieveErr) {
      console.warn(`Could not retrieve native child page object ${currentBlockId}:`, retrieveErr.message || retrieveErr);
    }

    // 2. Extract dedicated sub-page cover: page.cover (external or file S3 presigned URL)
    const nativeCoverUrl =
      childPageObj?.cover?.external?.url ||
      childPageObj?.cover?.file?.url ||
      null;

    // 3. Extract sub-page icon if present
    const nativeIcon =
      childPageObj?.icon?.emoji ||
      childPageObj?.icon?.file?.url ||
      childPageObj?.icon?.external?.url ||
      null;

    // 4. Fallback: if no native cover is set, use the first inline image block within the sub-page
    let fallbackInlineCoverUrl = null;
    if (!nativeCoverUrl && Array.isArray(currentBlocks)) {
      const firstImageBlock = currentBlocks.find((b) => b.type === "image");
      if (firstImageBlock?.image) {
        fallbackInlineCoverUrl =
          firstImageBlock.image.file?.url ||
          firstImageBlock.image.external?.url ||
          null;
      }
    }

    const finalSubPageCoverUrl = nativeCoverUrl || fallbackInlineCoverUrl || null;

    // 5. Generate markdown for the target leaf child page
    const leafMarkdown = await getPageMarkdown(currentBlockId, currentBlocks);

    // 6. Build synthesized article schema for child page.
    // Crucial: do NOT inherit parent's cover image! If finalSubPageCoverUrl is null, coverImage is null.
    // However, typography (font) and text color should be inherited from parent if not explicitly overridden on the sub-page.
    const childFontClass = childPageObj?.properties
      ? extractFontClass(childPageObj.properties)
      : "font-default";
    const finalFontClass =
      childFontClass !== "font-default"
        ? childFontClass
        : (rootArticle.fields.fontClass || "font-default");

    const childTextColor = childPageObj?.properties
      ? extractTextColor(childPageObj.properties)
      : null;
    const finalTextColor =
      (childTextColor && childTextColor !== "#30a6a6")
        ? childTextColor
        : (rootArticle.fields.textColor || "#30a6a6");

    const parentSlugPath = segments.slice(0, -1).join("/");
    const childArticle = {
      sys: {
        id: currentBlockId,
        createdAt: childPageObj?.created_time || rootPage.created_time,
      },
      fields: {
        title: currentTitle,
        slug: cleanPath,
        parentSlug: parentSlugPath,
        parentTitle: breadcrumbs[breadcrumbs.length - 2]?.title || rootArticle.fields.title,
        breadcrumbs,
        excerpt:
          leafMarkdown
            .replace(/[#*`_>[\]()]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 160) + "...",
        date: childPageObj?.created_time ? childPageObj.created_time.split("T")[0] : rootArticle.fields.date,
        tags: rootArticle.fields.tags,
        coverImage: finalSubPageCoverUrl
          ? {
              fields: {
                file: {
                  url: finalSubPageCoverUrl,
                },
              },
              isNativeCover: Boolean(nativeCoverUrl),
              isFallbackInline: Boolean(!nativeCoverUrl && fallbackInlineCoverUrl),
            }
          : null, // Triggers clean gradient placeholder in UI
        icon: nativeIcon,
        category: rootArticle.fields.category,
        fontClass: finalFontClass,
        textColor: finalTextColor,
        blocks: currentBlocks,
        content: leafMarkdown,
        s3Url: null,
      },
    };

    if (!isDev && CACHE_TTL_MS > 0) {
      articleCache.set(cleanPath, { timestamp: Date.now(), data: childArticle });
    }
    return childArticle;
  } catch (err) {
    console.error(`Error fetching Notion article by path '${cleanPath}':`, err);
    return findMockArticleByPath(cleanPath);
  }
}

// Get categories from published articles or database schema
export async function getNotionCategories() {
  const notion = getNotionClient();
  const databaseId = getDatabaseId();

  if (!notion || !databaseId) {
    return MOCK_CATEGORIES;
  }

  try {
    const articles = await getNotionArticles();
    if (!articles || articles.length === 0) {
      return MOCK_CATEGORIES;
    }

    const categoryMap = new Map();
    articles.forEach((art) => {
      const cat = art.fields.category?.fields;
      if (cat?.slug && !categoryMap.has(cat.slug)) {
        categoryMap.set(cat.slug, {
          sys: { id: `cat-${cat.slug}` },
          fields: {
            title: cat.title || cat.slug,
            slug: cat.slug,
          },
        });
      }
    });

    if (categoryMap.size > 0) {
      return Array.from(categoryMap.values());
    }

    return MOCK_CATEGORIES;
  } catch (err) {
    console.error("Error fetching Notion categories:", err);
    return MOCK_CATEGORIES;
  }
}
