
import { fetchWebsiteHtml } from "../../../infrastructure/http/website-fetcher.js";
import { parseWebsiteHtml } from "../../../infrastructure/parsers/html-parser.js";
import type { WebsiteContent } from "../model/website.model.js";

export const extractWebsiteContent = async (
    url: string
): Promise<WebsiteContent> => {
    const { html, finalUrl } = await fetchWebsiteHtml(url);

    return parseWebsiteHtml(html, finalUrl);
};
