const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface SummarizerResponse {
    success: boolean;
    message: string;
    data: {
        url: string;
        title: string;
        description?: string;
        summary: string;
        wordCount: number;
    };
}

export const summarizeWebsite = async (
    url: string
): Promise<SummarizerResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/summarizer/summarize`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Unable to summarize this website."
        );
    }

    return result as SummarizerResponse;
};