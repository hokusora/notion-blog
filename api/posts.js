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

  if (req.method === "OPTIONS") {
    if (typeof res.status === "function") {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  try {
    const category = req.query?.category || req.query?.categorySlug || null;
    const articles = await getNotionArticles(category);
    return sendJson(res, 200, articles);
  } catch (error) {
    console.error("API /api/posts error:", error);
    return sendJson(res, 500, { error: "Failed to fetch articles from Notion" });
  }
}

