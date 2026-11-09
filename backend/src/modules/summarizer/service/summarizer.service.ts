
import { extractWebsiteContent } from "../repository/summarizer.repository.js";
import type { WebsiteContent } from "../model/website.model.js";

export const extractWebsite = async (
    url: string
): Promise<WebsiteContent> => {
    const websiteContent = await extractWebsiteContent(url);

    return websiteContent;
};
