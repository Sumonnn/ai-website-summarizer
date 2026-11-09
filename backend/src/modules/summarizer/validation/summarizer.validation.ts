
import { z } from "zod";

export const extractWebsiteSchema = z.object({
    url: z
        .string()
        .trim()
        .min(1, "Website URL is required")
        .max(2048, "Website URL is too long")
        .url("Please provide a valid website URL")
        .refine(
            (value) => {
                try {
                    const parsedUrl = new URL(value);

                    return (
                        ["http:", "https:"].includes(parsedUrl.protocol) &&
                        !parsedUrl.username &&
                        !parsedUrl.password
                    );
                } catch {
                    return false;
                }
            },
            {
                message: "Only valid HTTP and HTTPS URLs are allowed.",
            }
        ),
});

export type ExtractWebsiteInput = z.infer<typeof extractWebsiteSchema>;
