import express from "express";
import {
  signup,
  singin,
  getAuth,
  forgotPassword,
  resetPassword,
  refreshToken,
} from "../controller/auth";
import {
  edit,
  findCartByUser,
  getAlluser,
  getone,
  remove,
} from "../controller/user";
import {
  requiredSignin,
  isAuth,
  checkToken,
  isSuperAdmin,
  isAdmin,
} from "../middlewares/checkAuth";
import { ROUTES } from "../constants/routes.constant";

const router = express.Router();

router.get(ROUTES.USER.ROOT, getAlluser);
router.get(ROUTES.USER.DETAIL, getAuth);
router.get(ROUTES.USER.USER_ONE, getone);
router.post(ROUTES.AUTH.SIGNUP, signup);
router.post(ROUTES.AUTH.SIGNIN, singin);
router.post(ROUTES.AUTH.REFRESH, refreshToken);
router.delete(
  ROUTES.USER.REMOVE,
  [checkToken,
    requiredSignin,
    isAuth,
    isAdmin,
    isSuperAdmin,
  ],
  remove
);
router.put(
  ROUTES.USER.UPDATE,
  [
    checkToken,
    requiredSignin,
    isAuth,
    isAdmin,
    isSuperAdmin,
  ],
  edit
);
router.post(ROUTES.USER.FORGOT_PASSWORD, forgotPassword);
router.post(ROUTES.USER.RESET_PASSWORD, resetPassword);
router.get(ROUTES.USER.GET_AUTH, getAuth);
// router.put('/user/image/:id', upload, editImage);
// router.post('/user/creating', uploadStorageUser.single("xlsx"), uploadXlxs);
router.get(ROUTES.USER.GET_USER_CART, findCartByUser);
router.param("userId", getAuth);

export default router;
