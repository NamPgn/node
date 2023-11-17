import express from "express";
import {
  sending,
  deleteApprove,
  getApprove,
  getApproves,
} from "../controller/approve";

const router = express.Router();

router.get("/approves", getApproves);
router.get("/approve", getApprove);
router.delete("/approve", deleteApprove);
router.put("/approve/sendding/:id", sending);

export default router;
