// In-memory cache for media sizes (URL -> { size: number, timestamp: number })
const mediaSizeCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function sendJson(res, statusCode, data) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}

// Fetch file size in bytes for a given media URL using HEAD or Range GET
async function probeMediaSize(url) {
  if (!url || typeof url !== "string") return 0;
  const cleanUrl = url.trim();
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    return 0;
  }

  // Check cache
  const cached = mediaSizeCache.get(cleanUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.size;
  }

  let size = 0;

  try {
    // 1. Try lightweight HTTP HEAD request
    const headResponse = await fetch(cleanUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(3500),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
    });

    if (headResponse.ok) {
      const contentLength = headResponse.headers.get("content-length");
      if (contentLength && !isNaN(Number(contentLength))) {
        size = parseInt(contentLength, 10);
      }
    }

    // 2. Fallback to Range GET if HEAD was blocked, 403/405, or didn't supply content-length
    if (size <= 0) {
      const rangeResponse = await fetch(cleanUrl, {
        method: "GET",
        headers: {
          Range: "bytes=0-0",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
        },
        signal: AbortSignal.timeout(3500),
      });

      if (rangeResponse.ok || rangeResponse.status === 206) {
        const contentRange = rangeResponse.headers.get("content-range");
        if (contentRange) {
          // Format: bytes 0-0/1234567
          const match = contentRange.match(/\/(\d+)$/);
          if (match && match[1]) {
            size = parseInt(match[1], 10);
          }
        }

        if (size <= 0) {
          const cl = rangeResponse.headers.get("content-length");
          if (cl && rangeResponse.status === 200) {
            size = parseInt(cl, 10);
          }
        }
      }
    }
  } catch {
    // Timeout or network error
    size = 0;
  }

  // Cache even if 0 to prevent hammering unresponsive servers
  mediaSizeCache.set(cleanUrl, { size, timestamp: Date.now() });
  return size;
}

export default async function handler(req, res) {
  // CORS support
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    if (typeof res.status === "function") {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  try {
    let urls = [];
    if (req.method === "POST") {
      const body = req.body || {};
      urls = Array.isArray(body.urls) ? body.urls : (body.url ? [body.url] : []);
    } else {
      const queryUrl = req.query?.url;
      if (queryUrl) {
        urls = Array.isArray(queryUrl) ? queryUrl : [queryUrl];
      }
    }

    // Deduplicate and filter valid URLs (limit to 50 items per batch to avoid abuse)
    const cleanUrls = [...new Set(urls.filter((u) => typeof u === "string" && u.trim().length > 0))].slice(0, 50);

    const sizes = {};
    await Promise.all(
      cleanUrls.map(async (url) => {
        const size = await probeMediaSize(url);
        sizes[url] = size;
      })
    );

    return sendJson(res, 200, {
      sizes,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("API /api/media-sizes error:", error);
    return sendJson(res, 500, { error: "Failed to probe media sizes" });
  }
}
