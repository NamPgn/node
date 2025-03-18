import express from "express";
import { deleteBanner, getBanners, uploadBanner } from "../controller/banner";
import { uploadServer } from "../services/upload";

const router = express.Router();

router.post("/banner/upload", uploadServer.single("file"), uploadBanner);
router.get("/banners", getBanners);
router.delete("/banner/:id", deleteBanner);
router.put("/banner/:id", deleteBanner);
export default router;
