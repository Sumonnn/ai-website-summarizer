
import { Router } from "express";
import { extractWebsiteController } from "../controller/summarizer.controller.js";

const router = Router();

router.post("/extract", extractWebsiteController);

export default router;
