import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function apiMiddlewarePlugin() {
  return {
    name: "notion-api-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
          if (url.pathname === "/api/posts") {
            const { default: postsHandler } = await import("./api/posts.js");
            req.query = Object.fromEntries(url.searchParams);
            return postsHandler(req, res);
          }
          if (url.pathname === "/api/post" || url.pathname.startsWith("/api/post/")) {
            const { default: postHandler } = await import("./api/post.js");
            req.query = Object.fromEntries(url.searchParams);
            if (url.pathname.startsWith("/api/post/")) {
              const slugFromPath = decodeURIComponent(url.pathname.slice("/api/post/".length));
              if (slugFromPath && !req.query.slug) {
                req.query.slug = slugFromPath;
              }
            }
            return postHandler(req, res);
          }
          if (url.pathname === "/api/categories") {
            const { default: categoriesHandler } = await import("./api/categories.js");
            req.query = Object.fromEntries(url.searchParams);
            return categoriesHandler(req, res);
          }
          if (url.pathname === "/api/health") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({ status: "ok" }));
          }
        } catch (err) {
          console.error("Vite API middleware error:", err);
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiMiddlewarePlugin()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
});

