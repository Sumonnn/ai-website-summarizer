import type { Request, Response, NextFunction } from "express";

import { extractWebsiteSchema } from "../validation/summarizer.validation.js";
import { summarizeWebsite } from "../service/summarizer.service.js";
import { AppError } from "../../../common/errors/app-error.js";

export const summarizeWebsiteController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const validationResult = extractWebsiteSchema.safeParse(req.body);

        if (!validationResult.success) {
            throw new AppError(
                400,
                validationResult.error.issues[0]?.message ??
                "Invalid request data."
            );
        }

        const { url } = validationResult.data;

        const result = await summarizeWebsite(url);

        res.status(200).json({
            success: true,
            message: "Website summarized successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};