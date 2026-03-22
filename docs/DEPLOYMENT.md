# Deployment

## Overview

The application is designed to deploy cleanly on Vercel because it uses:

- `Next.js App Router`
- Node runtime route handlers for server-side API calls
- environment-variable based OpenAI configuration
- no relational database in v1

## Recommended Deployment Target

Use `Vercel` for the web application.

Why it fits well:

- Next.js is a first-class framework on Vercel
- preview deployments are useful for prompt and UI iteration
- environment variables are easy to manage per environment
- the current API surface is small and serverless-friendly

Official references:

- https://vercel.com/docs/frameworks/nextjs
- https://vercel.com/docs/environment-variables
- https://nextjs.org/docs/app/getting-started/deploying

## Required Environment Variables

Set these in Vercel for both preview and production:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_FALLBACK_MODEL`
- `OPENAI_VECTOR_STORE_ID`
- `OPENAI_FILE_SEARCH_MAX_RESULTS`
- `APP_REGION_CODE`
- `APP_REGION_NAME`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_REGION_LABEL`

## Recommended Vercel Workflow

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Keep the framework preset as `Next.js`.
4. Add the required environment variables.
5. Deploy to preview.
6. Verify:
   - `/`
   - `/api/health`
   - `POST /api/chat` with real environment variables
7. Promote to production after manual verification.

## Ingestion Workflow

Do not rely on the Vercel build step for source ingestion.

Recommended approach:

1. Run ingestion locally or in a controlled script environment:
   - `npm run ingest -- --dry-run`
   - `npm run ingest`
2. Reuse the resulting `OPENAI_VECTOR_STORE_ID` in Vercel.
3. Re-run ingestion only when official source documents or metadata change.

## Operational Notes

- `POST /api/chat` uses `runtime = "nodejs"` and is suitable for Vercel.
- The route currently exports `maxDuration = 60` to give Responses API calls more headroom.
- Uploaded images are processed in-request and are not persisted by the application in v1.

## Risks And Caveats

- If official source documents change, the deployed app can become stale until re-ingested.
- Response latency depends on OpenAI API behavior and file search performance.
- Demo environments should be validated with the exact production environment variables before live use.
