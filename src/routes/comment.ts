import express from "express";
import { getAuth } from "../controller/auth";
import {
  addCommentController,
  getAllCommentsControllers,
  deleteComment,
  updateCommentController,
  findCommentByIdCategory,
  deleteMultipleComments,
} from "../controller/comment";
import {
  checkToken,
  isAdmin,
  isAuth,
  requiredSignin,
} from "../middlewares/checkAuth";
const routes = express.Router();

routes.get("/comments", getAllCommentsControllers);
routes.get("/comment/category/:id", findCommentByIdCategory);
routes.post(
  "/comment/:id/:userId",
  requiredSignin,
  checkToken,
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
routes.post(
  "/comments/deleteMultiple/:userId",
  requiredSignin,
  isAuth,
  isAdmin,
  deleteMultipleComments
);

routes.param("userId", getAuth);
export default routes;
