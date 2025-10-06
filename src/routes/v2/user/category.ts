import express from "express";
import {
  getAllCategories,
  getCategoryDetail,
  getLatestCategories,
  getTrendingCategories,
  searchCategories,
  getCategoriesByYear,
  getCategoriesByCountry,
  getCategoriesSitemap,
  getUpcomingReleases,
} from "../../../controller/v2/user/category";

const router = express.Router();

// ============ USER CATEGORY ROUTES V2 ============

/**
 * GET /api/v2/user/categories
 * User: Lấy danh sách categories (chỉ active)
 */
router.get("/", getAllCategories);

/**
 * GET /api/v2/user/categories/:id
 * User: Lấy chi tiết một category
 */
router.get("/:id", getCategoryDetail);

/**
 * GET /api/v2/user/categories/latest
 * User: Lấy categories mới nhất
 */
router.get("/latest", getLatestCategories);

/**
 * GET /api/v2/user/categories/trending
 * User: Lấy categories trending
 */
router.get("/trending", getTrendingCategories);

/**
 * GET /api/v2/user/categories/search
 * User: Tìm kiếm categories
 */
router.get("/search", searchCategories);

/**
 * GET /api/v2/user/categories/year/:year
 * User: Lấy categories theo năm
 */
router.get("/year/:year", getCategoriesByYear);

/**
 * GET /api/v2/user/categories/country/:country
 * User: Lấy categories theo quốc gia
 */
router.get("/country/:country", getCategoriesByCountry);

/**
 * GET /api/v2/user/categories/sitemap
 * User: Lấy categories sitemap (cho SEO)
 */
router.get("/sitemap", getCategoriesSitemap);

/**
 * GET /api/v2/user/categories/upcoming
 * User: Lấy upcoming releases
 */
router.get("/upcoming", getUpcomingReleases);

export default router;
