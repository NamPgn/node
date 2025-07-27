import express from "express";
import { getAuth } from "../controller/auth";
import {
  addCt,
  changeCategoryLatest,
  deleteCategoryController,
  filterCategoryTrending,
  getAll,
  getAllCategoryNotReq,
  getCategoryLatesupdate,
  getCategoryLatesupdateFromNextjs,
  getCategorySitemap,
  getOne,
  getUpcomingReleases,
  push,
  ratingCategory,
  ratingCategoryStats,
  ratingCategorysStatsAll,
  readProductByCategory,
  searchCategory,
  updateCate,
  backupCategories,
  getRecycleBin,
  restoreCategory,
  permanentlyDeleteCategory,
} from "../controller/category";
import {
  checkToken,
  isAdmin,
  isAuth,
  isSuperAdmin,
  requiredSignin,
} from "../middlewares/checkAuth";
import { uploadServer } from "../services/upload";
import { ROUTES } from "../constants/routes.constant";

const router = express.Router();

// Product by category routes
router.get(ROUTES.CATEGORY.PRODUCTS, readProductByCategory);

// Category listing routes
router.get(ROUTES.CATEGORY.ALL, getAll);
router.get(ROUTES.CATEGORY.SITEMAP, getCategorySitemap);
router.get(ROUTES.CATEGORY.LATEST, getCategoryLatesupdate);
router.get(ROUTES.CATEGORY.SEARCH, searchCategory);
router.get(ROUTES.CATEGORY.FILTER, filterCategoryTrending);
router.get(`${ROUTES.CATEGORY.ROOT}${ROUTES.CATEGORY.DETAIL}`, getOne);
router.post(ROUTES.CATEGORY.CHANGE_LATEST, changeCategoryLatest);
router.get(ROUTES.CATEGORY.LATEST_NEXT, getCategoryLatesupdateFromNextjs);

// Protected category management routes
router.post(
  ROUTES.CATEGORY.UPDATE,
  [
    checkToken,
    requiredSignin,
    isAuth,
    isAdmin,
    uploadServer.single("file")
  ],
  updateCate
);

router.get(ROUTES.CATEGORY.ALL_NOT_REQ, getAllCategoryNotReq);

router.post(
  ROUTES.CATEGORY.ADD,
  [
    checkToken,
    requiredSignin,
    isAuth,
    isAdmin,
    uploadServer.single("file")
  ],
  addCt
);

router.delete(
  ROUTES.CATEGORY.DELETE,
  [
    checkToken,
    requiredSignin,
    isAuth,
    isAdmin,
    isSuperAdmin
  ],
  deleteCategoryController
);

router.post(
  ROUTES.CATEGORY.WEEK,
  [
    checkToken,
    requiredSignin,
    isAuth,
    isAdmin
  ],
  push
);

// Rating routes
router.post(ROUTES.CATEGORY.RATING.ADD, ratingCategory);
router.get(ROUTES.CATEGORY.RATING.GET, ratingCategoryStats);
// router.get(ROUTES.CATEGORY.RATING.STATS, ratingCategorysStatsAll);

// Release routes
router.get(ROUTES.CATEGORY.RELEASES, getUpcomingReleases);

// Backup route
router.post(
  ROUTES.CATEGORY.BACKUP,
  [
    checkToken,
    requiredSignin,
    isAuth,
    isAdmin
  ],
  backupCategories
);

// Recycle bin routes
router.get(
  ROUTES.CATEGORY.RECYCLE_BIN,
  getRecycleBin
);

router.post(
  ROUTES.CATEGORY.RESTORE,
  [
    checkToken,
    requiredSignin,
    isAuth,
    isAdmin
  ],
  restoreCategory
);

router.delete(
  ROUTES.CATEGORY.PERMANENT_DELETE,
  [
    checkToken,
    requiredSignin,
    isAuth,
    isAdmin,
    isSuperAdmin
  ],
  permanentlyDeleteCategory
);

// Param middleware
router.param("userId", getAuth);

export default router;
