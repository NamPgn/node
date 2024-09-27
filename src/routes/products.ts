import express from "express";
import {
  addProduct,
  deleteMultipleProduct,
  delProduct,
  editProduct,
  getAllProducts,
  getOne,
  getAllProductsByCategory,
  findCommentByIdProduct,
  pushtoTypes,
  pushToWeek,
  sendingApprove,
  cancelSendingApprove,
  filterCategoryByProducts,
  searchProducts,
  uploadXlxsProducts,
  clearCacheProducts,
  mostWatchesEposides,
  approveMultipleMovies,
  editMultipleMovies,
  autoAddProduct,
} from "../controller/products";
import { uploadServer } from "../services/upload";
import {
  checkToken,
  isAdmin,
  isAuth,
  isSuperAdmin,
  requiredSignin,
} from "../middlewares/checkAuth";
import { getAuth } from "../controller/auth";
import { uploadAbyss } from "../controller/video.server.abyss";
import { uploadVimeo } from "../controller/video.server.dinary";

const router = express.Router();
router.get("/products", getAllProducts);
router.get("/product/filter", filterCategoryByProducts);
router.get("/product/v", searchProducts);
router.get("/product/:id", getOne);
router.get("/category/products/:id", getAllProductsByCategory);
router.get("/product/comments/:id", findCommentByIdProduct);
router.post("/product/vimeo", uploadServer.single("fileDinary"), uploadVimeo);
router.post(
  "/products/clear/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  clearCacheProducts
);
router.delete(
  "/product/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  isSuperAdmin,
  delProduct
);
router.post(
  "/product/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  uploadServer.single("image"),
  addProduct
);
router.put(
  "/product/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isSuperAdmin,
  uploadServer.single("image"),
  editProduct
);
router.post(
  "/products/creating",
  // checkToken,
  // requiredSignin,
  // isAuth,
  // isAdmin,
  uploadServer.single("excelProduct"),
  uploadXlxsProducts
);
router.post(
  "/products/deleteMultiple/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isSuperAdmin,
  deleteMultipleProduct
);
router.post(
  "/product/pushlist/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  pushtoTypes
);
router.post(
  "/product/week/:id",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  pushToWeek
);
router.post(
  "/product/approve/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  isSuperAdmin,
  sendingApprove
);

router.post(
  "/product/approve/cancel/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  isSuperAdmin,
  cancelSendingApprove
);
router.post(
  "/product/abyss/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  uploadServer.single("fileupload"),
  uploadAbyss
);

router.post(
  "/products/approvedMultiple/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  approveMultipleMovies
);
router.post(
  "/products/encodeMultipleDailymotionServer/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  editMultipleMovies
);
// router.post("/product/rating/:productId", ratingProducts);
// router.get("/product/rate/:productId", ratingProductStats);
// router.get("/products/rating/stats", ratingProductsStats);
router.get("/most-watched-episodes", mostWatchesEposides);
router.post(
  "/products/autoAddEpisodeMovie/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  autoAddProduct
);
router.param("userId", getAuth);
export default router;
