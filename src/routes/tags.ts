import express from "express";
import {
    createTag,
    getTags,
    getTagById,
    updateTag,
    deleteTag,
} from "../controller/tags.controller";

const router = express.Router();

router.post("/tags", createTag);

router.get("/tags", getTags);

router.get("/tags/:id", getTagById);

router.put("/tags/:id", updateTag);

router.delete("/tags/:id", deleteTag);

export default router;
