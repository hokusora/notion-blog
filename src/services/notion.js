// src/services/notion.js
// Client-side service communicating with secure backend /api routes with graceful fallback

import { MOCK_ARTICLES, MOCK_CATEGORIES } from "./mockData";

export const getArticles = async () => {
  try {
    const res = await fetch("/api/posts");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return MOCK_ARTICLES;
  } catch (error) {
    console.warn("Could not fetch articles from Notion API, using fallback data:", error);
    return MOCK_ARTICLES;
  }
};

export const getArticleBySlug = async (slug) => {
  try {
    const res = await fetch(`/api/post?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    if (data && data.fields) {
      return data;
    }
    return MOCK_ARTICLES.find((a) => a.fields.slug === slug) || null;
  } catch (error) {
    console.warn(`Could not fetch article '${slug}' from Notion API, using fallback data:`, error);
    return MOCK_ARTICLES.find((a) => a.fields.slug === slug) || null;
  }
};

export const getArticlesByCategory = async (categorySlug) => {
  try {
    const res = await fetch(`/api/posts?category=${encodeURIComponent(categorySlug)}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (error) {
    console.warn(`Could not fetch articles for category '${categorySlug}' from Notion API:`, error);
  }

  // Client-side fallback filter
  return MOCK_ARTICLES.filter((item) => {
    const cat = item.fields.category;
    if (Array.isArray(cat)) {
      return cat.some((c) => c?.fields?.slug === categorySlug);
    }
    return cat?.fields?.slug === categorySlug;
  });
};

export const getCategories = async () => {
  try {
    const res = await fetch("/api/categories");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return MOCK_CATEGORIES;
  } catch (error) {
    console.warn("Could not fetch categories from Notion API, using fallback data:", error);
    return MOCK_CATEGORIES;
  }
};
