
import express from "express";
import cors from "cors";

import { env } from "./config/env.js";

import healthRoutes from "./modules/health/routes/health.routes.js";
import summarizerRoutes from "./modules/summarizer/routes/summarizer.routes.js";

import {
    errorHandler,
    notFoundHandler,
} from "./common/middlewares/error.middleware.js";

const app = express();

// CORS configuration
app.use(
    cors({
        origin: env.FRONTEND_URL,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);

// Parse JSON request bodies
app.use(express.json({ limit: "1mb" }));

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/summarizer", summarizerRoutes);

// Handle unknown routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
