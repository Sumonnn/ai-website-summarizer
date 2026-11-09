import { Router } from "express";

import { summarizeWebsiteController } from "../controller/summarizer.controller.js";

const router = Router();

router.post("/summarize", summarizeWebsiteController);

export default router;