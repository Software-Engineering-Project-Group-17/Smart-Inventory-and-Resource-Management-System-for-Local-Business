import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ping } from "../controllers/healthController.js";

const router = Router();
router.get("/ping", asyncHandler(ping));

export default router;
