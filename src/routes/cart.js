import express from 'express';
import { createCartController, deleteCartController, getAllCartControllers } from '../controller/cart';
import { requiredSignin, isAuth, checkToken } from "../middlewares/checkAuth";
import { getAuth } from '../controller/auth';
const router = express.Router();


router.get('/cart', getAllCartControllers);
router.post('/cart/:userId', checkToken, requiredSignin, isAuth, createCartController);
router.post('/cart/:id/:userId', checkToken, requiredSignin, isAuth, deleteCartController);
router.param('userId', getAuth);
export default router