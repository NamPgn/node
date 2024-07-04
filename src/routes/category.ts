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
  getOne,
  push,
  ratingCategory,
  ratingCategoryStats,
  ratingCategorysStatsAll,
  readProductByCategory,
  searchCategory,
  updateCate,
} from "../controller/category";
import {
  checkToken,
  isAdmin,
  isAuth,
  isSuperAdmin,
  requiredSignin,
} from "../middlewares/checkAuth";
import { uploadServer } from "../services/upload";
const router = express.Router();

router.get("/category/products", readProductByCategory);
router.get("/categorys", getAll);
router.get("/category/latest", getCategoryLatesupdate);
router.get("/categorys/search", searchCategory);
router.get("/category/filters", filterCategoryTrending);
router.get("/category/:id", getOne);
router.post("/category/changeLatest", changeCategoryLatest);
router.post(
  "/category/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  uploadServer.single("file"),
  updateCate
);
router.get("/category/getAllCategoryNotRequest/:id", getAllCategoryNotReq);
router.post(
  "/category/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  uploadServer.single("file"),
  addCt
);
router.delete(
  "/category/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  isSuperAdmin,
  deleteCategoryController
);
router.post(
  "/category/week/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  push
);
router.post("/rating/:categoryId", ratingCategory);

router.get("/rate/:categoryId", ratingCategoryStats);
router.get("/rating/stats", ratingCategorysStatsAll);
router.param("userId", getAuth);
export default router;
