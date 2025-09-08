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
  exportDataToExcel,
  clearCacheRedisAndQueue,
  addMultipleEpisodes,
  editVoiceOverBySlugController,
  getVoiceOverBySlugController,
  uploadProductThumbnail,
  updateProductThumbnail,
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
import { ROUTES } from "../constants/routes.constant";

const router = express.Router();

router.get(ROUTES.PRODUCTS.ROOT, getAllProducts);
router.get(ROUTES.PRODUCTS.FILTER, filterCategoryByProducts);
router.get(ROUTES.PRODUCTS.SEARCH, searchProducts);
router.get(ROUTES.PRODUCTS.DETAIL, getOne);
router.get(ROUTES.PRODUCTS.BY_CATEGORY, getAllProductsByCategory);
router.get(ROUTES.PRODUCTS.COMMENTS, findCommentByIdProduct);
router.post(ROUTES.PRODUCTS.VIMEO, uploadServer.single("fileDinary"), uploadVimeo);
router.post(ROUTES.PRODUCTS.ADD_MULTIPLE, checkToken,
  requiredSignin,
  isAuth,
  isAdmin, addMultipleEpisodes);
router.post(
  ROUTES.PRODUCTS.CLEAR_CACHE,
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  clearCacheProducts
);

router.delete(
  ROUTES.PRODUCTS.DELETE,
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  isSuperAdmin,
  delProduct
);

router.post(
  ROUTES.PRODUCTS.ADD,
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  uploadServer.single("image"),
  addProduct
);

router.put(
  ROUTES.PRODUCTS.UPDATE,
  checkToken,
  requiredSignin,
  isAuth,
  isSuperAdmin,
  uploadServer.single("image"),
  editProduct
);

router.post(
  ROUTES.PRODUCTS.UPLOAD_EXCEL,
  [checkToken,
    requiredSignin,
    isAuth,
    isSuperAdmin,
    uploadServer.single("excelProduct")
  ],
  uploadXlxsProducts
);

router.post(
  ROUTES.PRODUCTS.DELETE_MULTIPLE,
  checkToken,
  requiredSignin,
  isAuth,
  isSuperAdmin,
  deleteMultipleProduct
);

router.post(
  ROUTES.PRODUCTS.PUSH_TO_TYPES,
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  pushtoTypes
);

router.post(
  ROUTES.PRODUCTS.PUSH_TO_WEEK,
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  pushToWeek
);

router.post(
  ROUTES.PRODUCTS.APPROVE,
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  isSuperAdmin,
  sendingApprove
);

router.post(
  ROUTES.PRODUCTS.CANCEL_APPROVE,
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  isSuperAdmin,
  cancelSendingApprove
);

router.post(
  ROUTES.PRODUCTS.UPLOAD_ABYSS,
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  uploadServer.single("fileupload"),
  uploadAbyss
);

router.post(
  ROUTES.PRODUCTS.APPROVE_MULTIPLE,
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  approveMultipleMovies
);

router.post(
  ROUTES.PRODUCTS.ENCODE_MULTIPLE,
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  editMultipleMovies
);



router.post(
  ROUTES.PRODUCTS.AUTO_ADD,
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  autoAddProduct
);

router.post(ROUTES.PRODUCTS.CLEAR_REDIS, clearCacheRedisAndQueue);
router.get(ROUTES.PRODUCTS.EXPORT_EXCEL, exportDataToExcel);
router.post(
  "/product/:id/thumbnail/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  uploadServer.single("file"),
  uploadProductThumbnail
);
router.put(
  "/product/:id/thumbnail/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  uploadServer.single("file"),
  updateProductThumbnail
);
router.post(ROUTES.PRODUCTS.EDIT_VOICE_OVER, [
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin
], editVoiceOverBySlugController);
router.get(ROUTES.PRODUCTS.GET_VOICE_OVER, getVoiceOverBySlugController);
router.param("userId", getAuth);

export default router;
