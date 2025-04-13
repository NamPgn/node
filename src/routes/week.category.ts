import express from "express";
import {
  all,
  create,
  createManyCategory,
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
import { ROUTES } from "../constants/routes.constant";

const routerWeek = express.Router();

routerWeek.get(ROUTES.WEEK.ALL, all);
routerWeek.get(ROUTES.WEEK.ROOT, one);
routerWeek.post(
  ROUTES.WEEK.ADD,
  [
    checkToken,
    requiredSignin,
    isAuth
  ],
  create
);
routerWeek.delete(
  ROUTES.WEEK.DELETE,
  [
    checkToken,
    requiredSignin,
    isAuth
  ],
  del
);
routerWeek.put(
  ROUTES.WEEK.UPDATE,
  [
    checkToken,
    requiredSignin,
    isAuth
  ],
  edit
);
routerWeek.post(
  ROUTES.WEEK.DELETE_CATEGORY,
  [
    checkToken,
    requiredSignin,
    isAuth,
    isAdmin,
    isSuperAdmin
  ],
  deleteCategoryByWeek
);

routerWeek.post(
  ROUTES.WEEK.INSERT_MANY,
  [
    checkToken,
    requiredSignin,
    isAuth,
    isAdmin,
    isSuperAdmin
  ],
  createManyCategory
);
routerWeek.param("userId", getAuth);
export default routerWeek;
