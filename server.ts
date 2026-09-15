import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import postsHandler from "./api/posts.js";
import postHandler from "./api/post.js";
import categoriesHandler from "./api/categories.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API routes
  app.get("/api/posts", (req, res) => {
    postsHandler(req, res);
  });

  app.get("/api/post", (req, res) => {
    postHandler(req, res);
  });

  app.get("/api/post/:slug", (req, res) => {
    req.query.slug = req.params.slug;
    postHandler(req, res);
  });

  app.get("/api/categories", (req, res) => {
    categoriesHandler(req, res);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Express 5 route wildcard syntax
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
