import { Express } from "express";
import routerAuth from "../routes/auth";
import routerProducts from "../routes/products";
import routerCategory from "../routes/category";
import routerTrailer from "../routes/trailer.home";
import routerComments from "../routes/comment";
import routerCart from "../routes/cart";
import routerTypes from "../routes/types";
import routerCategorymain from "../routes/categorymain";
import routerImage from "../routes/image.user";
import routerWeek from "../routes/week.category";
import routerApprove from "../routes/approve";
import routerBanner from "../routes/banner";
import routerSeason from "../routes/season";
import routerReport from "../routes/report";
import routerSlider from "../routes/slider";
const routes = [
  routerAuth,
  routerProducts,
  routerCategory,
  routerTrailer,
  routerComments,
  routerCart,
  routerTypes,
  routerCategorymain,
  routerWeek,
  routerImage,
  routerApprove,
  routerBanner,
  routerSeason,
  routerReport,
  routerSlider
];

export const configureRoutes = (app: Express) => {
  routes.forEach(router => {
    app.use("/api", router);
  });
};