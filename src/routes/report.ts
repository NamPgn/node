import express from "express";
import { createReport, getAllReports, getProductReports } from "../controller/report";

const router = express.Router();

// Route để tạo report mới (không cần đăng nhập)
router.post("/reports", createReport);

// Route để lấy resports của một phim cụ thể
router.get("/report/:productId", getProductReports);

// Route để lấy tất cả reports (có phân trang)
router.get("/reports", getAllReports);

export default router;
