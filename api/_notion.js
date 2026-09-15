import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { MOCK_ARTICLES, MOCK_CATEGORIES } from "../src/services/mockData.js";

// Helper to sanitize / slugify strings
export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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

// Map Notion page properties to the blog article schema
export function mapNotionPageToArticle(page, markdownContent = "") {
  const props = page.properties || {};

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

// Convert Notion page blocks to Markdown
export async function getPageMarkdown(pageId) {
  const notion = getNotionClient();
  if (!notion) return "";
  const cleanPageId = parseNotionId(pageId);
  if (!cleanPageId) return "";

  try {
    const n2m = new NotionToMarkdown({ notionClient: notion });
    const mdblocks = await n2m.pageToMarkdown(cleanPageId);
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
export async function getNotionArticles(categorySlug = null) {
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

// Get single article by slug including full page content
export async function getNotionArticleBySlug(slug) {
  const notion = getNotionClient();
  const databaseId = getDatabaseId();

  if (!notion || !databaseId) {
    return MOCK_ARTICLES.find((a) => a.fields.slug === slug) || null;
  }

  try {
    let response;
    try {
      response = await queryNotionDatabase(notion, databaseId);
    } catch (innerErr) {
      console.warn(`Failed to query database for slug '${slug}':`, innerErr.message || innerErr);
      return MOCK_ARTICLES.find((a) => a.fields.slug === slug) || null;
    }

    const pages = response?.results || [];
    let page = pages.find((p) => {
      const art = mapNotionPageToArticle(p);
      return art.fields.slug === slug;
    });

    if (!page && pages.length > 0) {
      // Fallback: match by title slugified or page ID
      page = pages.find((p) => {
        const art = mapNotionPageToArticle(p);
        return (
          slugify(art.fields.title) === slug ||
          p.id === slug ||
          parseNotionId(p.id) === parseNotionId(slug)
        );
      });
    }

    if (!page) {
      // Fallback to mock data if slug exists in mocks
      return MOCK_ARTICLES.find((a) => a.fields.slug === slug) || null;
    }

    const markdown = await getPageMarkdown(page.id);
    return mapNotionPageToArticle(page, markdown);
  } catch (err) {
    console.error(`Error fetching Notion article by slug '${slug}':`, err);
    return MOCK_ARTICLES.find((a) => a.fields.slug === slug) || null;
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
