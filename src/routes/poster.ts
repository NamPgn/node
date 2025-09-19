import express from "express";
import { deletePoster, getPosterById, getPosters, getPostersByCategory, updatePoster, createPoster, bulkCreatePosters, bulkUpdatePosters } from "../controller/poster";
import { uploadServer } from "../services/upload";
import multer from "multer";

const router = express.Router();

// Single file upload
router.post("/posters", uploadServer.single("file"), createPoster);

// Multiple files upload (bulk)
router.post("/posters/bulk", uploadServer.array("files", 10), bulkCreatePosters);

// Get posters
router.get("/posters", getPosters);
router.get("/posters/category/:categoryId", getPostersByCategory);
router.get("/posters/:id", getPosterById);

// Update poster
router.put("/posters/:id", uploadServer.single("file"), updatePoster);

// Bulk operations
router.put("/posters/bulk", bulkUpdatePosters);

// Delete poster
router.delete("/posters/:id", deletePoster);

export default router;


