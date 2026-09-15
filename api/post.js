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

  if (req.method === "OPTIONS") {
    if (typeof res.status === "function") {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  try {
    const slug = req.query?.slug || req.params?.slug;
    if (!slug) {
      return sendJson(res, 400, { error: "Slug query parameter is required" });
    }

    const article = await getNotionArticleBySlug(slug);
    if (!article) {
      return sendJson(res, 404, { error: "Article not found" });
    }

    return sendJson(res, 200, article);
  } catch (error) {
    console.error("API /api/post error:", error);
    return sendJson(res, 500, { error: "Failed to fetch article from Notion" });
  }
}
