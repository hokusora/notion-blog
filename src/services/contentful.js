/**
 * @deprecated Contentful has been deprecated in favor of Notion.
 * All functions are now routed to Notion headless CMS service.
 */
export {
  getArticles,
  getArticleBySlug,
  getArticlesByCategory,
  getCategories,
} from "./notion.js";
