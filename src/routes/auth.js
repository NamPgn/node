import express from "express";
import { signup, singin, getAuth } from "../controller/auth";
import { upload, uploadXlxs, uploadStorageUser } from "../services/upload";
import { commented, edit, findCartByUser, getAlluser, getone, remove } from "../controller/user";
import { requiredSignin, isAuth, checkToken, isSuperAdmin, isAdmin } from "../middlewares/checkAuth";
const router = express.Router();

router.get('/user', getAlluser);
router.get('/user/:id', getAuth);
router.get('/user_one/:id', getone)
router.post('/signup', signup);
router.post('/signin', singin);
router.delete('/removeUser/:id/:userId', checkToken, requiredSignin, isAuth, isAdmin, isSuperAdmin, remove);
router.put('/user/:id/:userId', checkToken, requiredSignin, isAuth, isAdmin, isSuperAdmin, edit);
router.get('/user/:id', getAuth);
// router.put('/user/image/:id', upload, editImage);
// router.post('/user/creating', uploadStorageUser.single("xlsx"), uploadXlxs);
router.post('/user/comment', commented);
router.get('/user/cart/:id', findCartByUser);
router.param('userId', getAuth)
export default router;