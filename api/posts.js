import { getNotionArticles } from "./_notion.js";

function sendJson(res, statusCode, data) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // CORS headers
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
    const category = req.query?.category || req.query?.categorySlug || null;
    const articles = await getNotionArticles(category, { refresh });
    return sendJson(res, 200, articles);
  } catch (error) {
    console.error("API /api/posts error:", error);
    return sendJson(res, 500, { error: "Failed to fetch articles from Notion" });
  }
}

