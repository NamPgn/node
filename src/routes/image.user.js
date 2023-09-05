import express from "express";
import { getAuth } from "../controller/auth";
import { isAuth, requiredSignin } from "../middlewares/checkAuth";
import { editBackground, getImage, uploadUserImageToCloudDinary } from "../controller/image.user";
import { uploadServer } from "../services/upload";
const router = express.Router()

router.get('/background', getImage)
router.post('/background/:id/:userId', requiredSignin, isAuth, uploadServer.single('file'), editBackground)
router.post('/user/upload/:userId', requiredSignin, isAuth, uploadServer.single('file'), uploadUserImageToCloudDinary);
router.param('userId', getAuth)
export default router;