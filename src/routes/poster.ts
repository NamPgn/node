import express from "express";
import { deletePoster, getPosterById, getPosters, getPostersByCategory, updatePoster, createPoster } from "../controller/poster";
import { uploadServer } from "../services/upload";

const router = express.Router();

router.post("/posters", uploadServer.single("file"), createPoster);
router.get("/posters", getPosters);
router.get("/posters/category/:categoryId", getPostersByCategory);
router.get("/posters/:id", getPosterById);
router.put("/posters/:id", uploadServer.single("file"), updatePoster);
router.delete("/posters/:id", deletePoster);

export default router;


