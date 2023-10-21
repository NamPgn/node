import express from "express";
import { searchCategory } from "../controller/category";
import {
  addProduct,
  deleteMultipleProduct,
  delete_,
  editProduct,
  getAllProducts,
  getOne,
  getAllProductsByCategory,
  findCommentByIdProduct,
  pushtoTypes,
  pushToWeek,
} from "../controller/products";
import {
  uploadDinary,
  uploadServer,
  uploadStorageProduct,
  uploadXlxsProducts,
  uploadvideoandimage,
} from "../services/upload";
import {
  checkToken,
  isAdmin,
  isAuth,
  isSuperAdmin,
  requiredSignin,
} from "../middlewares/checkAuth";
import { getAuth } from "../controller/auth";
import { uploadServer2 } from "../controller/video.server.abyss";
import { uploadVimeo } from "../controller/video.server.dinary";

const router = express.Router();
router.get("/products", getAllProducts);
router.get("/product/:id", getOne);
router.get("/category/products/:id", getAllProductsByCategory);
router.get("/products/search", searchCategory);
router.get("/product/comments/:id", findCommentByIdProduct);
router.post("/product/vimeo", uploadServer.single("fileDinary"), uploadVimeo);
router.post(
  "/product/abyss/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  uploadServer.single("fileupload"),
  uploadServer2,
);
router.delete(
  "/product/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  isSuperAdmin,
  delete_,
);
router.post(
  "/product/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  uploadServer.single("image"),
  addProduct,
);
router.put(
  "/product/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isSuperAdmin,
  uploadServer.single("image"),
  editProduct,
);
router.post(
  "/product/creating:/userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  uploadStorageProduct.single("xlsxProduct"),
  uploadXlxsProducts,
);
router.post(
  "/product/deleteMultiple:/userId",
  checkToken,
  requiredSignin,
  isAuth,
  isSuperAdmin,
  deleteMultipleProduct,
);
router.post(
  "/product/pushlist/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  pushtoTypes,
);
router.post("/product/week/:id", pushToWeek);
router.param("userId", getAuth);
export default router;
