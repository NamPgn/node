import express from "express";
import { getAuth } from "../controller/auth";
import {
  addCt,
  deleteCategoryController,
  filterCategoryTrending,
  getAll,
  getAllCategoryNotReq,
  getOne,
  push,
  readProductByCategory,
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
router.get("/category/filters", filterCategoryTrending);
router.get("/category/:id", getOne);
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
router.param("userId", getAuth);
export default router;
