import express from "express";
import {
  all,
  create,
  del,
  deleteCategoryByWeek,
  edit,
  one,
} from "../controller/week.categoty";
import {
  requiredSignin,
  isAuth,
  checkToken,
  isSuperAdmin,
  isAdmin,
} from "../middlewares/checkAuth";
import { getAuth } from "../controller/auth";
const routerWeek = express.Router();

routerWeek.get("/weeks", all);
routerWeek.get("/week", one);
routerWeek.post("/week/:userId", checkToken, requiredSignin, isAuth, create);
routerWeek.delete("/week/:id/:userId", checkToken, requiredSignin, isAuth, del);
routerWeek.put("/week/:id/:userId", checkToken, requiredSignin, isAuth, edit);
routerWeek.post(
  "/week/category/:id/:userId",
  checkToken,
  requiredSignin,
  isAuth,
  isAdmin,
  isSuperAdmin,
  deleteCategoryByWeek
);
routerWeek.param("userId", getAuth);
export default routerWeek;
