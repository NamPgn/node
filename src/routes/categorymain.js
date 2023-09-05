import express from "express";
import {
  addCategorymain, deleteCategorymainByproduct,
  getAllCategorymain,
  getOneCategoryMain, updateCategorymain
} from "../controller/categorymain";
import { isAdmin, isAuth, requiredSignin } from "../middlewares/checkAuth";
import { getAuth } from '../controller/auth';
const router = express.Router();

router.get('/categorymain', getAllCategorymain);
router.get('/categorymain/:id', getOneCategoryMain);
router.post('/categorymain/:userId', requiredSignin, isAuth, isAdmin, addCategorymain);
router.post('/categorymain/:id/:userId', requiredSignin, isAuth, isAdmin, deleteCategorymainByproduct);
router.put('/category/:id', requiredSignin, isAuth, isAdmin, updateCategorymain);
router.param('userId', getAuth);
export default router