
import type {
    ErrorRequestHandler,
    RequestHandler,
} from "express";

import { AppError } from "../errors/app-error.js";

export const notFoundHandler: RequestHandler = (
    req,
    res
): void => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

export const errorHandler: ErrorRequestHandler = (
    error,
    _req,
    res,
    _next
): void => {
    console.error("API Error:", error);

    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });

        return;
    }

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
