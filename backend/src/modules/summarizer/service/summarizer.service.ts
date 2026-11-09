import { extractWebsiteContent } from "../repository/summarizer.repository.js";
import { generateWebsiteSummary } from "../../../infrastructure/ai/gemini.client.js";

export interface SummarizerResult {
    url: string;
    title: string;
    description?: string;
    summary: string;
    wordCount: number;
}

export const summarizeWebsite = async (
    url: string
): Promise<SummarizerResult> => {
    // Step 1: Extract website content
    const websiteContent = await extractWebsiteContent(url);

    // Step 2: Generate AI summary
    const summary = await generateWebsiteSummary(
        websiteContent.title,
        websiteContent.content
    );

    // Step 3: Return structured result
    return {
        url: websiteContent.url,
        title: websiteContent.title,
        description: websiteContent.description,
        summary,
        wordCount: websiteContent.wordCount,
    };
};