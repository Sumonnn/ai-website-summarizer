import { useState } from "react";
import { summarizeWebsite } from "./services/summarizer.service";

interface SummaryResult {
  url: string;
  title: string;
  description?: string;
  summary: string;
  wordCount: number;
}

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Please enter a website URL.");
      return;
    }

    try {
      const parsedUrl = new URL(trimmedUrl);

      if (
        !["http:", "https:"].includes(parsedUrl.protocol) ||
        parsedUrl.username ||
        parsedUrl.password
      ) {
        setError("Please enter a valid HTTP or HTTPS URL.");
        return;
      }
    } catch {
      setError("Please enter a valid website URL.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const response = await summarizeWebsite(trimmedUrl);
      setResult(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);

      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy the summary.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main id="home">
        <section className="relative overflow-hidden px-5 pb-16 pt-20 sm:px-8 sm:pb-6 sm:pt-10">
          <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />

          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Powered by Artificial Intelligence
            </div>

            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Understand any website
              <span className="block text-indigo-600">
                in seconds.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Turn lengthy web pages into clear, concise summaries.
              Just paste a website URL and let AI do the reading for you.
            </p>

            {/* URL Input Card */}
            <div
              id="summarizer"
              className="mx-auto mt-4 max-w-3xl rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60 sm:p-5"
            >
              <div className="mb-3 flex items-center gap-2 px-2 text-left text-sm font-semibold text-slate-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5 text-indigo-600"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Enter website URL
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSummarize();
                }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5 shrink-0 text-slate-400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>

                  <input
                    type="url"
                    value={url}
                    onChange={(event) =>
                      setUrl(event.target.value)
                    }
                    placeholder="https://example.com/article"
                    disabled={loading}
                    className="h-14 w-full min-w-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Summarising...
                    </>
                  ) : (
                    <>
                      Summarise Website
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M5 12h14m-7-7 7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <p className="mt-3 px-2 text-left text-xs text-slate-400">
                Supports publicly accessible HTTP and HTTPS websites.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-600"
                >
                  {error}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Quick summaries
              </span>
              <span className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                AI-powered insights
              </span>
              <span className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Simple and easy to use
              </span>
            </div>
          </div>
        </section>

        {/* Summary Result */}
        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto max-w-4xl">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

                <h2 className="mt-5 text-lg font-bold text-slate-800">
                  Analysing your website...
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Extracting content and generating your AI summary.
                </p>
              </div>
            ) : result ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                      AI Generated Summary
                    </span>

                    <h2 className="mt-4 break-words text-2xl font-bold text-slate-900">
                      {result.title}
                    </h2>

                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block break-all text-sm text-indigo-600 hover:underline"
                    >
                      {result.url}
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleCopy()}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {copied ? "Copied!" : "Copy Summary"}
                  </button>
                </div>

                {result.description && (
                  <p className="mt-5 border-l-2 border-indigo-200 pl-4 text-sm leading-7 text-slate-500">
                    {result.description}
                  </p>
                )}

                <div className="my-6 border-t border-slate-100" />

                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                  Summary
                </h3>

                <p className="whitespace-pre-line text-base leading-8 text-slate-700">
                  {result.summary}
                </p>

                <div className="mt-8 flex items-center gap-2 border-t border-slate-100 pt-5 text-sm text-slate-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5 text-indigo-600"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>

                  <span>
                    Original website content:{" "}
                    <strong className="text-slate-800">
                      {result.wordCount.toLocaleString()} words
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-8 w-8"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
                  </svg>
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-800">
                  Your summary will appear here
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Enter a website URL above and generate an AI-powered
                  summary to get started.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;