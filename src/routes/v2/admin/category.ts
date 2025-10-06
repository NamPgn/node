import { Router } from "express";
import { getAllCategory3d } from "../../../controller/v2/admin/category-3d";
import { ROUTES } from "../../../constants/routes.constant";
import { getAllCategory2d } from "../../../controller/v2/admin/category-2d";
import { getAllCategoryByVersion } from "../../../controller/v2/admin/category-by-version";

const router = Router();

// Main endpoint that frontend calls
router.get(ROUTES.CATEGORY.ROOT, getAllCategoryByVersion);

// Specific version endpoints
router.get(ROUTES.CATEGORY.ALL_3D, getAllCategory3d);
router.get(ROUTES.CATEGORY.ALL_2D, getAllCategory2d);

export default router;