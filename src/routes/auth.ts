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
const router = express.Router();

router.get("/user", getAlluser);
router.get("/user/:id", getAuth);
router.get("/user_one/:id", getone);
router.post("/signup", signup);
router.post("/signin", singin);
router.post('/refreshToken',refreshToken)
router.delete(
  "/removeUser/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  isSuperAdmin,
  remove
);
router.put(
  "/user/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  isSuperAdmin,
  edit
);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);
router.get("/user/:id", getAuth);
// router.put('/user/image/:id', upload, editImage);
// router.post('/user/creating', uploadStorageUser.single("xlsx"), uploadXlxs);
router.get("/user/cart/:id", findCartByUser);
router.param("userId", getAuth);
export default router;
