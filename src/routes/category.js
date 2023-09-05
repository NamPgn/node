import express from "express";
import { getAuth } from "../controller/auth";
import { addCt, deleteCategoryController, getAll, getAllCategoryNotReq, getOne, push, readProductByCategory, updateCate } from "../controller/category";
import { checkToken, isAdmin, isAuth, requiredSignin } from "../middlewares/checkAuth";
import { uploadCategory } from "../services/upload";
const router = express.Router();

router.get('/category/products', readProductByCategory);
router.get('/categorys', getAll);
router.get('/category/:id', getOne);
router.get('/category/getAllCategoryNotRequest/:id', getAllCategoryNotReq);
router.post('/category/:userId', checkToken, requiredSignin, isAuth, isAdmin, uploadCategory.single('file'), addCt);
router.put('/category/:id/:userId', checkToken, requiredSignin, isAuth, isAdmin, uploadCategory.single('file'), updateCate);
router.delete('/category/:id/:userId', checkToken, requiredSignin, isAuth, isAdmin, deleteCategoryController)
router.post('/category/week/:id/:userId', checkToken, requiredSignin, isAuth, isAdmin, push);
router.param('userId', getAuth);
export default router