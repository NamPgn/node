import express from "express";
import {
  createFeatureBanner,
  getFeatureBanners,
  getFeatureBannerById,
  updateFeatureBanner,
  deleteFeatureBanner,
  updateFeatureBannerOrder,
  toggleFeatureBannerStatus,
} from "../controller/feature-banner";
import { checkToken, isAdmin, requiredSignin } from "../middlewares/checkAuth";

const router = express.Router();

// Public routes
router.get("/feature-banners", getFeatureBanners);
router.get("/feature-banner/:id", getFeatureBannerById);

// Admin routes - yêu cầu authentication và quyền admin
router.post(
  "/feature-banner",
  requiredSignin,
  checkToken,
  isAdmin,
  createFeatureBanner
);

router.put(
  "/feature-banner/:id",
  requiredSignin,
  checkToken,
  isAdmin,
  updateFeatureBanner
);

router.delete(
  "/feature-banner/:id",
  requiredSignin,
  checkToken,
  isAdmin,
  deleteFeatureBanner
);

router.put(
  "/feature-banners/update-order",
  requiredSignin,
  checkToken,
  isAdmin,
  updateFeatureBannerOrder
);

router.patch(
  "/feature-banner/:id/toggle-status",
  requiredSignin,
  checkToken,
  isAdmin,
  toggleFeatureBannerStatus
);

export default router;

