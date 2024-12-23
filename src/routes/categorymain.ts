import express from "express";
import {
  addCategorymain,
  deleteCategoryType,
  getAllCategorymain,
  getOneCategoryMain,
  updateCategorymain,
} from "../controller/categorymain";
import { isAdmin, isAuth, requiredSignin } from "../middlewares/checkAuth";
import { getAuth } from "../controller/auth";
const router = express.Router();

router.get("/bigcategory/content", getAllCategorymain);
router.get("/bigcategory/content/:id", getOneCategoryMain);
router.post(
  "/bigcategory/content/:userId",
  requiredSignin,
  isAuth,
  isAdmin,
  addCategorymain
);
router.delete(
  "/bigcategory/content/:id/:userId",
  requiredSignin,
  isAuth,
  isAdmin,
  deleteCategoryType
);
router.put(
  "/bigcategory/content/:id",
  requiredSignin,
  isAuth,
  isAdmin,
  updateCategorymain
);
router.param("userId", getAuth);
export default router;
