import crypto from "crypto";
import fs from "fs";
import path from "path";

function sendJson(res, statusCode, data) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}

// Compare two strings using SHA-256 hashes and timingSafeEqual to prevent timing attacks
function safeCompare(input, secret) {
  if (typeof input !== "string" || typeof secret !== "string") {
    return false;
  }
  const hashInput = crypto.createHash("sha256").update(input).digest();
  const hashSecret = crypto.createHash("sha256").update(secret).digest();
  return crypto.timingSafeEqual(hashInput, hashSecret);
}

// Get configured passcode from environment or .env file
function getAppPassword() {
  if (process.env.APP_PASSWORD) {
    return process.env.APP_PASSWORD;
  }
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/^APP_PASSWORD=(.*)$/m);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch {
    // Ignore read error
  }
  return "dev-pass_123";
}

export default async function handler(req, res) {
  // CORS support
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    if (typeof res.status === "function") {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { success: false, error: "Method not allowed" });
  }

  try {
    let body = req.body;
    // In case body parser wasn't run
    if (!body && typeof req.on === "function") {
      body = await new Promise((resolve) => {
        let data = "";
        req.on("data", (chunk) => {
          data += chunk;
        });
        req.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({});
          }
        });
      });
    }

    const { password } = body || {};
    const configuredPassword = getAppPassword();

    if (!password || typeof password !== "string") {
      return sendJson(res, 400, { success: false, error: "Passcode is required" });
    }

    const isValid = safeCompare(password.trim(), configuredPassword.trim());

    if (isValid) {
      return sendJson(res, 200, { success: true });
    } else {
      return sendJson(res, 401, { success: false, error: "Incorrect passcode" });
    }
  } catch (err) {
    console.error("Passcode verification error:", err);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}
