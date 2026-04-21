import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";

type FileEntry = {
  path: string;
  description: string;
};

const files: FileEntry[] = [
  {
    path: "package.json",
    description: "Project scripts, dependencies, and runtime metadata.",
  },
  {
    path: "tsconfig.json",
    description: "TypeScript compiler settings for the project.",
  },
  {
    path: "vercel.json",
    description: "Vercel deployment and Korea-only access policy configuration.",
  },
  {
    path: ".env.example",
    description: "Environment variable template for local and deployed environments.",
  },
  {
    path: "src/app/layout.tsx",
    description: "Root layout for the Next.js application.",
  },
  {
    path: "src/app/page.tsx",
    description: "Home page composition for the main user experience.",
  },
  {
    path: "src/app/globals.css",
    description: "Global styles used across the application.",
  },
  {
    path: "src/app/api/health/route.ts",
    description: "Health check endpoint for runtime readiness.",
  },
  {
    path: "src/app/api/chat/route.ts",
    description: "Main chat endpoint that validates input and calls the AI layer.",
  },
  {
    path: "src/components/home-hero.tsx",
    description: "Top hero section shown on the landing page.",
  },
  {
    path: "src/components/example-questions.tsx",
    description: "Starter questions to help users understand what to ask.",
  },
  {
    path: "src/components/question-workspace.tsx",
    description: "Question form, file upload logic, and request lifecycle UI.",
  },
  {
    path: "src/components/answer-card.tsx",
    description: "Structured answer renderer for decision, reason, and prep steps.",
  },
  {
    path: "src/components/citation-list.tsx",
    description: "Citation rendering component for official sources.",
  },
  {
    path: "src/lib/api-errors.ts",
    description: "Helpers for returning stable JSON error responses.",
  },
  {
    path: "src/lib/config.ts",
    description: "Environment variable loading and public/server config access.",
  },
  {
    path: "src/lib/contracts.ts",
    description: "Shared Zod schemas and TypeScript types for API contracts.",
  },
  {
    path: "src/lib/source-catalog.ts",
    description: "Source catalog loader and authoritative source helpers.",
  },
  {
    path: "src/lib/openai/client.ts",
    description: "OpenAI client creation and reuse.",
  },
  {
    path: "src/lib/openai/prompt.ts",
    description: "System and user prompt construction logic.",
  },
  {
    path: "src/lib/openai/response-schema.ts",
    description: "Model response schema for structured output parsing.",
  },
  {
    path: "src/lib/openai/chat.ts",
    description: "Core OpenAI call flow, retrieval handling, and citation normalization.",
  },
  {
    path: "scripts/ingest-docs.ts",
    description: "Official source ingestion and vector store synchronization script.",
  },
];

function languageFromPath(filePath: string) {
  switch (extname(filePath)) {
    case ".ts":
      return "ts";
    case ".tsx":
      return "tsx";
    case ".css":
      return "css";
    case ".json":
      return "json";
    default:
      if (filePath.endsWith(".env.example")) {
        return "bash";
      }

      return "";
  }
}

function buildHeader() {
  return `# Code Review Pack

## Purpose

This document is a Notion-friendly code review package for EcoGuide AI.
It is meant for teammates who need to:

- understand the overall codebase structure
- review the implementation without opening every file manually
- discuss refactoring ideas
- prepare presentation material or reports based on the real code

## How To Use This Document

Recommended reading order:

1. Project summary
2. Architecture map
3. Review checklist
4. File inventory
5. Full source appendix

## Project Summary

EcoGuide AI is a Cheonan-focused waste disposal assistant built as a Next.js full-stack web app.
Users can ask a waste-disposal question with optional image upload, and the server returns a structured answer grounded in official sources.

Current implementation includes:

- Next.js web UI
- \`GET /api/health\`
- \`POST /api/chat\`
- OpenAI Responses API integration
- OpenAI File Search retrieval
- source ingestion script
- Vercel deployment configuration

## Architecture Map

\`\`\`text
[User]
  -> [Next.js UI]
  -> [API Route: /api/chat]
  -> [OpenAI Responses API]
  -> [File Search over official sources]
  -> [Structured answer + citations]
\`\`\`

## Review Checklist

- Does input validation in the API match the intended product behavior?
- Are error messages understandable and stable?
- Is citation handling tied tightly enough to authoritative sources?
- Does the ingestion flow avoid duplicate uploads and support reindexing safely?
- Are UI components easy to follow and refactor?
- Are config loading and environment assumptions explicit?
- Are there places where naming, separation of concerns, or reuse can be improved?

## File Inventory

| File | Purpose |
| --- | --- |
${files.map((file) => `| \`${file.path}\` | ${file.description} |`).join("\n")}

## Full Source Appendix
`;
}

async function buildDocument() {
  const sections = await Promise.all(
    files.map(async (file) => {
      const content = await readFile(file.path, "utf8");
      const language = languageFromPath(file.path);

      return `## ${file.path}

${file.description}

\`\`\`${language}
${content}
\`\`\`
`;
    }),
  );

  return `${buildHeader()}\n\n${sections.join("\n")}`;
}

async function main() {
  const outputPath = join("docs", "CODE_REVIEW_PACK.md");
  const document = await buildDocument();

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, document, "utf8");

  console.log(`Generated ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
