
import type { Request, Response, NextFunction } from "express";

import { extractWebsiteSchema } from "../validation/summarizer.validation.js";
import { extractWebsite } from "../service/summarizer.service.js";
import { AppError } from "../../../common/errors/app-error.js";

export const extractWebsiteController = async (
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

        const websiteContent = await extractWebsite(url);

        res.status(200).json({
            success: true,
            message: "Website content extracted successfully.",
            data: websiteContent,
        });
    } catch (error) {
        next(error);
    }
};
