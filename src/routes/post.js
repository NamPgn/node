import express from "express";
import { getAllPostLists, addPostList } from "../controller/post";

const router = express.Router();

router.get('/post', getAllPostLists);
router.post('/post', addPostList)
export default router