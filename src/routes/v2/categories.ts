import express from "express";
import { ROUTES_V2 } from "../../constants/routes.constant";
import { getAllCategoryAdmin } from "../../controller/v2/admin/categories";

const router = express.Router();

// Product by category routes
router.get(ROUTES_V2.CATEGORY.ROOT, getAllCategoryAdmin);

export default router;