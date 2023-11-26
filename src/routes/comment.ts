import express from "express";
import { getAuth } from "../controller/auth";
import {
  addCommentController,
  getAllCommentsControllers,
  getCommentsUserId,
  deleteComment,
  updateCommentController,
} from "../controller/comment";
import { isAdmin, isAuth, requiredSignin } from "../middlewares/checkAuth";
const routes = express.Router();

routes.get("/comments", getAllCommentsControllers);
routes.get("/comment/userId/:userId/productId/:productId", getCommentsUserId);
routes.post(
  "/comment/:id/:userId",
  requiredSignin,
  isAuth,
  addCommentController
);
routes.post("/comment/:userId", requiredSignin, isAuth, isAdmin, deleteComment);
routes.put(
  "/comment/:id/:userId",
  requiredSignin,
  isAuth,
  isAdmin,
  updateCommentController
);
routes.param("userId", getAuth);
export default routes;
