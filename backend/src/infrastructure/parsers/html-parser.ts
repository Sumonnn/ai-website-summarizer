
import { load } from "cheerio";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

import type { WebsiteContent } from "../../modules/summarizer/model/website.model.js";
import { AppError } from "../../common/errors/app-error.js";

const MIN_CONTENT_LENGTH = 100;

const normalizeText = (value: string): string => {
    return value
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\s*\n\s*/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

export const parseWebsiteHtml = (
    html: string,
    url: string
): WebsiteContent => {
    const $ = load(html);

    // Extract metadata before removing unnecessary elements.
    const metadataTitle =
        $('meta[property="og:title"]').attr("content") ||
        $("title").first().text();

    const description =
        $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content") ||
        undefined;

    // Remove elements that don't contain useful article content.
    $(
        "script, style, noscript, iframe, svg, canvas, " +
        "nav, footer, header, aside, form, button, " +
        "[aria-hidden='true'], [hidden]"
    ).remove();

    // Try extracting the main article using Readability.
    const dom = new JSDOM($.html(), {
        url,
    });

    const reader = new Readability(dom.window.document, {
        charThreshold: 100,
    });

    const article = reader.parse();

    dom.window.close();

    // Prefer Readability's article extraction.
    let content = article?.textContent ?? "";

    // Fall back to cleaned HTML body text if necessary.
    if (content.trim().length < MIN_CONTENT_LENGTH) {
        content = $("body").text();
    }

    content = normalizeText(content);

    const title = normalizeText(
        article?.title || metadataTitle || new URL(url).hostname
    );

    if (content.length < MIN_CONTENT_LENGTH) {
        throw new AppError(
            422,
            "Unable to extract sufficient readable content from this website."
        );
    }

    const wordCount = content.split(/\s+/).filter(Boolean).length;

    return {
        url,
        title,
        content,
        description: description
            ? normalizeText(description)
            : undefined,
        wordCount,
    };
};
