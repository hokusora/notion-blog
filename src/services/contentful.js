import * as contentful from "contentful";
import { MOCK_ARTICLES, MOCK_CATEGORIES } from "./mockData";

const space = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

// Initialize the Contentful Client safely with fallback
let client = null;
if (space && accessToken) {
  try {
    client = contentful.createClient({
      space,
      accessToken,
    });
  } catch (error) {
    console.warn("Could not initialize Contentful client:", error);
  }
}

// Lấy tất cả bài, kèm include: 2 để load linked Category entry
export const getArticles = async () => {
  if (client) {
    try {
      const entries = await client.getEntries({
        content_type: "koreanBlog",
        order: "-sys.createdAt",
        include: 2,
      });
      if (entries?.items?.length) {
        return entries.items;
      }
    } catch (error) {
      console.warn("Error fetching articles from Contentful, using fallback data:", error);
    }
  }
  return MOCK_ARTICLES;
};

// Lấy 1 bài theo slug
export const getArticleBySlug = async (slug) => {
  if (client) {
    try {
      const entries = await client.getEntries({
        content_type: "koreanBlog",
        "fields.slug": slug,
        limit: 1,
        include: 2,
      });
      if (entries?.items?.[0]) {
        return entries.items[0];
      }
    } catch (error) {
      console.warn("Error fetching article by slug from Contentful, using fallback data:", error);
    }
  }
  return MOCK_ARTICLES.find((article) => article.fields.slug === slug) || null;
};

// Lấy bài theo category slug — filter phía client vì CDA không hỗ trợ
// query linked-entry field trực tiếp ("fields.category.fields.slug")
export const getArticlesByCategory = async (categorySlug) => {
  let allArticles = [];
  if (client) {
    try {
      const entries = await client.getEntries({
        content_type: "koreanBlog",
        order: "-sys.createdAt",
        include: 2,
      });
      if (entries?.items?.length) {
        allArticles = entries.items;
      }
    } catch (error) {
      console.warn("Error fetching articles by category from Contentful, using fallback data:", error);
    }
  }

  if (!allArticles.length) {
    allArticles = MOCK_ARTICLES;
  }

  // Filter: giữ lại bài có category.fields.slug khớp
  return allArticles.filter((item) => {
    const cat = item.fields.category;
    // category có thể là array (multi-ref) hoặc single ref
    if (Array.isArray(cat)) {
      return cat.some((c) => c?.fields?.slug === categorySlug);
    }
    return cat?.fields?.slug === categorySlug;
  });
};

// Lấy tất cả categories — dùng để render nav hoặc danh sách
export const getCategories = async () => {
  if (client) {
    try {
      const entries = await client.getEntries({
        content_type: "category",
        order: "fields.title",
      });
      if (entries?.items?.length) {
        return entries.items;
      }
    } catch (error) {
      console.warn("Error fetching categories from Contentful, using fallback data:", error);
    }
  }
  return MOCK_CATEGORIES;
};
