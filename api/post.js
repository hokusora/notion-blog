import { getNotionArticleBySlug } from "./_notion.js";

function sendJson(res, statusCode, data) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // CORS support
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Disable caching so edits made in Notion reflect immediately upon browser refresh
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  if (req.method === "OPTIONS") {
    if (typeof res.status === "function") {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  try {
    const refresh = req.query?.refresh === "true" || req.query?.refresh === "1";
    let rawSlug = req.query?.slug || req.query?.path || req.params?.slug || req.params?.["0"] || req.params?.[0];
    if (Array.isArray(rawSlug)) {
      rawSlug = rawSlug.join("/");
    }
    const slug = rawSlug
      ? decodeURIComponent(String(rawSlug).replace(/,/g, "/")).replace(/^\/+|\/+$/g, "")
      : null;
    if (!slug) {
      return sendJson(res, 400, { error: "Slug query parameter is required" });
    }

    const article = await getNotionArticleBySlug(slug, { refresh });
    if (!article) {
      return sendJson(res, 404, { error: "Article not found", slug });
    }

    return sendJson(res, 200, article);
  } catch (error) {
    console.error("API /api/post error:", error);
    return sendJson(res, 500, { error: "Failed to fetch article from Notion" });
  }
}
