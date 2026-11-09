
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().default(5000),

    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    FRONTEND_URL: z.string().url(),

    GEMINI_API_KEY: z
        .string()
        .min(1, "Gemini API key is required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error(
        "Invalid environment configuration:",
        parsedEnv.error.flatten()
    );

    process.exit(1);
}

export const env = parsedEnv.data;
