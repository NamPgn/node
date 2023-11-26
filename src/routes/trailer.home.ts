import express from "express";
import { getAuth } from "../controller/auth";
import { create, editTrailerHomePageUrlController, getTrailerController, getUrlTrailerControllers } from "../controller/trailer.home";
import { isAdmin, isAuth, requiredSignin } from "../middlewares/checkAuth";
import { uploadTrailer } from "../services/upload";
const router = express.Router()

router.get('/trailer', getTrailerController);
router.post('/trailer/:userId', requiredSignin, isAuth, isAdmin, uploadTrailer.single('url'), create);
router.put('/trailer/:id/:userId', requiredSignin, isAuth, isAdmin, uploadTrailer.single('url'), editTrailerHomePageUrlController);
router.param('userId', getAuth);
export default router;