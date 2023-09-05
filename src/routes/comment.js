import express from "express";
import { getAuth } from "../controller/auth";
import { addCommentController, getAllCommentsControllers, getCommentsUserId, deleteComment, updateCommentController } from "../controller/comment";
import router from "./products";
import { isAdmin, isAuth, requiredSignin } from "../middlewares/checkAuth";
const routes = express.Router();

routes.get('/comments', getAllCommentsControllers);
routes.get('/comment/userId/:userId/productId/:productId', getCommentsUserId);
routes.post('/comment/:id/:userId', requiredSignin, isAuth, addCommentController);
router.delete('/comment/:id/:userId', requiredSignin, isAuth, isAdmin, deleteComment);
router.put('/comment/:id/:userId', requiredSignin, isAuth, isAdmin, updateCommentController)
router.param('userId', getAuth)
export default routes