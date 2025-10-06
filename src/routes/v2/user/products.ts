import { Router } from "express";
import {
  getAllProducts,
  getProductDetail,
  incrementViewCount,
} from "../../../controller/v2/user/episode";

const router = Router();

/**
 * GET /api/v2/user/products
 * User: Lấy danh sách products (approved only)
 */
router.get("/", getAllProducts);

/**
 * GET /api/v2/user/products/:id
 * User: Lấy chi tiết một product
 */
router.get("/:id", getProductDetail);

/**
 * POST /api/v2/user/products/:id/view
 * User: Tăng view count
 */
router.post("/:id/view", incrementViewCount);

export default router;