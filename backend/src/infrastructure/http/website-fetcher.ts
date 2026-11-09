
import axios from "axios";
import { lookup } from "node:dns/promises";
import type { Readable } from "node:stream";
import http from "node:http";
import https from "node:https";
import ipaddr from "ipaddr.js";

import { AppError } from "../../common/errors/app-error.js";

const REQUEST_TIMEOUT = 15000;
const MAX_RESPONSE_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_REDIRECTS = 3;

const USER_AGENT =
    "AI-Website-Summarizer/1.0 (+website content extraction)";

interface PinnedAddress {
    address: string;
    family: number;
}

interface FetchResult {
    html: string;
    finalUrl: string;
}

const isPublicIp = (address: string): boolean => {
    try {
        const parsed = ipaddr.process(address);

        return parsed.range() === "unicast";
    } catch {
        return false;
    }
};

const validateUrl = (value: string): URL => {
    let url: URL;

    try {
        url = new URL(value);
    } catch {
        throw new AppError(400, "Invalid website URL.");
    }

    if (!["http:", "https:"].includes(url.protocol)) {
        throw new AppError(400, "Only HTTP and HTTPS URLs are supported.");
    }

    if (url.username || url.password) {
        throw new AppError(400, "URLs containing credentials are not allowed.");
    }

    // Restrict requests to standard web ports.
    const expectedPort = url.protocol === "https:" ? "443" : "80";

    if (url.port && url.port !== expectedPort) {
        throw new AppError(400, "Non-standard ports are not allowed.");
    }

    url.hash = "";

    return url;
};

const resolvePublicAddress = async (
    hostname: string
): Promise<PinnedAddress> => {
    // Handle literal IP addresses without DNS lookup.
    if (ipaddr.isValid(hostname)) {
        if (!isPublicIp(hostname)) {
            throw new AppError(403, "Access to private or reserved IP addresses is blocked.");
        }

        return {
            address: ipaddr.process(hostname).toString(),
            family: ipaddr.process(hostname).kind() === "ipv4" ? 4 : 6,
        };
    }

    let records;

    try {
        records = await lookup(hostname, {
            all: true,
            verbatim: true,
        });
    } catch {
        throw new AppError(400, "Unable to resolve website hostname.");
    }

    if (!records.length) {
        throw new AppError(400, "Website hostname has no valid IP address.");
    }

    // Reject the hostname if ANY resolved address is non-public.
    for (const record of records) {
        if (!isPublicIp(record.address)) {
            throw new AppError(403, "Website resolves to a private or reserved IP address.");
        }
    }

    return {
        address: records[0].address,
        family: records[0].family,
    };
};

const createPinnedAgents = (target: PinnedAddress) => {
    const lookupPinned = (
        _hostname: string,
        options: { all?: boolean },
        callback: (...args: any[]) => void
    ) => {
        if (options.all) {
            callback(null, [
                {
                    address: target.address,
                    family: target.family,
                },
            ]);
            return;
        }

        callback(null, target.address, target.family);
    };

    return {
        httpAgent: new http.Agent({
            keepAlive: false,
            lookup: lookupPinned as any,
        }),

        httpsAgent: new https.Agent({
            keepAlive: false,
            lookup: lookupPinned as any,
        }),
    };
};


const readLimitedStream = async (
    stream: Readable
): Promise<string> => {
    const chunks: Buffer[] = [];
    let totalSize = 0;

    try {
        for await (const chunk of stream) {
            const buffer = Buffer.isBuffer(chunk)
                ? chunk
                : Buffer.from(chunk);

            totalSize += buffer.length;

            if (totalSize > MAX_RESPONSE_SIZE) {
                stream.destroy();

                throw new AppError(
                    413,
                    "Website content exceeds the maximum allowed size."
                );
            }

            chunks.push(buffer);
        }
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        console.error("Website stream reading error:", error);

        throw new AppError(
            502,
            "Failed to read website response."
        );
    }

    return Buffer.concat(chunks).toString("utf-8");
};


export const fetchWebsiteHtml = async (
    inputUrl: string
): Promise<FetchResult> => {
    let currentUrl = validateUrl(inputUrl);

    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
        const hostname = currentUrl.hostname.replace(/^\[|\]$/g, "");

        const target = await resolvePublicAddress(hostname);
        const agents = createPinnedAgents(target);

        try {
            const response = await axios.get(currentUrl.toString(), {
                responseType: "stream",
                timeout: REQUEST_TIMEOUT,

                httpAgent: agents.httpAgent,
                httpsAgent: agents.httpsAgent,

                // We validate every redirect ourselves.
                maxRedirects: 0,

                // Do not accept non-2xx responses automatically.
                validateStatus: () => true,

                headers: {
                    "User-Agent": USER_AGENT,
                    Accept: "text/html,application/xhtml+xml",
                },

                // Limit decompressed response size.
                // maxContentLength: MAX_RESPONSE_SIZE,
            });

            const status = response.status;

            if ([301, 302, 303, 307, 308].includes(status)) {
                response.data.destroy();

                const location = response.headers.location;

                if (!location) {
                    throw new AppError(502, "Website returned an invalid redirect.");
                }

                if (redirectCount === MAX_REDIRECTS) {
                    throw new AppError(400, "Too many website redirects.");
                }

                // The next loop validates the complete redirect destination.
                currentUrl = validateUrl(
                    new URL(location, currentUrl).toString()
                );

                continue;
            }

            if (status < 200 || status >= 300) {
                response.data.destroy();

                throw new AppError(
                    502,
                    `Website returned HTTP ${status}.`
                );
            }

            const contentType = response.headers["content-type"] ?? "";

            if (
                !contentType.toString().includes("text/html") &&
                !contentType.toString().includes("application/xhtml+xml")
            ) {
                response.data.destroy();

                throw new AppError(
                    415,
                    "The provided URL does not return an HTML webpage."
                );
            }

            const html = await readLimitedStream(response.data);

            if (!html.trim()) {
                throw new AppError(422, "Website returned empty HTML content.");
            }

            return {
                html,
                finalUrl: currentUrl.toString(),
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            if (axios.isAxiosError(error)) {
                if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
                    throw new AppError(504, "Website request timed out.");
                }

                throw new AppError(502, "Unable to fetch website content.");
            }

            throw new AppError(502, "Unexpected error while fetching website.");
        } finally {
            agents.httpAgent.destroy();
            agents.httpsAgent.destroy();
        }
    }

    throw new AppError(400, "Unable to follow website redirects.");
};
