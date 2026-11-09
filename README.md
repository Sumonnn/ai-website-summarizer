# AI-Driven Website Summariser

An AI-powered web application that extracts readable content from any publicly accessible website and generates a concise, meaningful summary using Google's Gemini AI.

Users can simply enter a website URL, and the application will automatically fetch the webpage, extract its main content, and generate an AI-powered summary within seconds.

## Features

- **Website URL Input:** Enter any publicly accessible website URL.
- **Content Extraction:** Automatically extracts readable content from webpages.
- **AI-Powered Summarisation:** Uses Google Gemini AI to generate concise summaries.
- **Clean User Interface:** Simple, responsive, and user-friendly design.
- **Copy Summary:** Copy generated summaries with one click.
- **Input Validation:** Validates URLs before processing.
- **Error Handling:** Provides meaningful error messages for invalid URLs, inaccessible websites, and AI service failures.
- **SSRF Protection:** Validates URLs, checks DNS-resolved IP addresses, validates redirects, and restricts access to non-public network addresses.
- **Response Size Limiting:** Restricts website response size to prevent excessive resource consumption.

## Technology Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS v4

### Backend

- Node.js
- Express.js
- TypeScript
- Axios
- Cheerio
- Mozilla Readability
- JSDOM
- Zod
- ipaddr.js

### AI Integration

- Google Gemini API
- `@google/genai`

## Project Architecture

The project follows a modular, feature-oriented backend architecture with clear separation of responsibilities.

```text
ai-website-summarizer/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── summarizer/
│   │   │   │   ├── controller/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   ├── routes/
│   │   │   │   ├── service/
│   │   │   │   └── validation/
│   │   │   │
│   │   │   └── health/
│   │   │       ├── controller/
│   │   │       └── routes/
│   │   │
│   │   ├── common/
│   │   │   ├── errors/
│   │   │   └── middlewares/
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── ai/
│   │   │   ├── http/
│   │   │   └── parsers/
│   │   │
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── summarizer.service.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## How It Works

The application follows this workflow:

1. The user enters a website URL in the frontend.
2. The frontend sends a POST request to the backend API.
3. The backend validates the submitted URL.
4. The website fetcher retrieves the webpage HTML securely.
5. Cheerio and Mozilla Readability extract the main readable content.
6. The extracted content is passed to the Google Gemini API.
7. Gemini generates a concise summary.
8. The backend returns the summary and website information as a JSON response.
9. The frontend displays the generated summary to the user.

## Prerequisites

Before running the project, make sure you have installed:

- Node.js (v18 or later recommended)
- npm
- Google Gemini API key

You can generate a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

## Installation and Setup

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ai-website-summarizer
```

### 1. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory using `.env.example` as a reference.

**backend/.env**

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

Replace `your_gemini_api_key` with your actual Google Gemini API key.

Start the backend development server:

```bash
npm run dev
```

Backend will run at:

```text
http://localhost:5000
```

### 2. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the frontend directory using `.env.example` as a reference.

**frontend/.env**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

Open the frontend URL in your browser to use the application.

## API Documentation

### Health Check

Checks whether the backend server is running.

**Endpoint**

```http
GET /api/health
```

**Example Response**

```json
{
  "success": true,
  "message": "AI Website Summariser API is running",
  "data": {
    "status": "healthy",
    "timestamp": "2026-11-10T10:00:00.000Z"
  }
}
```

### Summarise Website

Extracts website content and generates an AI-powered summary.

**Endpoint**

```http
POST /api/summarizer/summarize
```

**Request Headers**

```http
Content-Type: application/json
```

**Request Body**

```json
{
  "url": "https://example.com"
}
```

**Successful Response**

```json
{
  "success": true,
  "message": "Website summarized successfully.",
  "data": {
    "url": "https://example.com/",
    "title": "Example Domain",
    "summary": "A concise AI-generated summary of the website content.",
    "wordCount": 25
  }
}
```

**Possible Error Responses**

| Status Code | Description |
|---|---|
| 400 | Invalid request or URL |
| 404 | API route not found |
| 422 | Insufficient readable website content |
| 502 | AI summarisation service error |
| 503 | AI service temporarily unavailable |
| 500 | Internal server error |

## Security Considerations

The backend implements several protections when fetching external websites:

- Only HTTP and HTTPS URLs are accepted.
- URLs containing embedded credentials are rejected.
- Only standard HTTP and HTTPS ports are permitted.
- DNS resolution is checked to reject non-public IP addresses.
- HTTP requests use validated DNS-resolved addresses to reduce DNS rebinding risks.
- Redirect destinations are validated before following them.
- The number of redirects is limited.
- Website response size is limited to 5 MB.
- Website content length sent to the AI model is limited.
- The Gemini API key is stored in backend environment variables and is never exposed to the frontend.
- Website content is treated as untrusted source material, not as instructions for the AI model.

## Available Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Starts the backend development server |
| `npm run build` | Compiles TypeScript into JavaScript |
| `npm run start` | Starts the compiled production server |
| `npm run typecheck` | Checks TypeScript types without generating files |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Creates the production frontend build |
| `npm run preview` | Previews the production build |

## Environment Variables

### Backend

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `NODE_ENV` | Application environment |
| `FRONTEND_URL` | Allowed frontend origin for CORS |
| `GEMINI_API_KEY` | Google Gemini API key |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |

## Future Improvements

Potential enhancements for future versions include:

- Support for summarising PDF documents.
- Multiple summary formats and lengths.
- Language selection for generated summaries.
- Export summaries as PDF or text files.
- User authentication and summary history.
- Production deployment and performance optimisation.

---

*Built with React, Node.js, TypeScript, and Google Gemini AI.*