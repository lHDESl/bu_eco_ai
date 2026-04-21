import { randomUUID } from "node:crypto";
import { zodTextFormat } from "openai/helpers/zod";
import type {
  ResponseFileSearchToolCall,
  ResponseInput,
} from "openai/resources/responses/responses";
import { errorBodySchema, type ChatResponse } from "../contracts";
import { getServerConfig } from "../config";
import {
  getAuthoritativeSourceMap,
  getAuthoritativeSources,
  type SourceRecord,
} from "../source-catalog";
import { getOpenAIClient } from "./client";
import { buildSystemPrompt, buildUserPrompt } from "./prompt";
import { modelChatResponseSchema } from "./response-schema";

type ChatInput = {
  question: string;
  imageDataUrl?: string;
};

type RetrievedSourceMatch = {
  excerpt: string | null;
  file_id: string | null;
  filename: string | null;
  score: number | null;
};

function normalizeOptionalString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function collectRetrievedSourceMatches(
  output: ReadonlyArray<{
    type: string;
    results?: Array<ResponseFileSearchToolCall.Result> | null;
  }>,
  authoritativeSourceMap: Map<string, SourceRecord>,
) {
  const matches = new Map<string, RetrievedSourceMatch[]>();

  for (const item of output) {
    if (item.type !== "file_search_call" || !item.results) {
      continue;
    }

    for (const result of item.results) {
      const sourceId = result.attributes?.source_id;

      if (typeof sourceId !== "string" || !authoritativeSourceMap.has(sourceId)) {
        continue;
      }

      const currentMatches = matches.get(sourceId) ?? [];
      currentMatches.push({
        excerpt: normalizeOptionalString(result.text),
        file_id: result.file_id ?? null,
        filename: result.filename ?? null,
        score: typeof result.score === "number" ? result.score : null,
      });
      matches.set(sourceId, currentMatches);
    }
  }

  return matches;
}

function normalizeCitations(
  citations: ChatResponse["citations"],
  retrievedSourceMatches: Map<string, RetrievedSourceMatch[]>,
  authoritativeSourceMap: Map<string, SourceRecord>,
) {
  const normalizedCitations: ChatResponse["citations"] = [];
  const seen = new Set<string>();

  for (const citation of citations) {
    const source = authoritativeSourceMap.get(citation.source_id);
    const retrievedMatches = retrievedSourceMatches.get(citation.source_id);

    if (!source || !retrievedMatches || retrievedMatches.length === 0) {
      continue;
    }

    const pageHint = normalizeOptionalString(citation.page_hint);
    const excerpt =
      normalizeOptionalString(citation.excerpt) ?? retrievedMatches[0]?.excerpt ?? null;
    const dedupeKey = `${citation.source_id}:${pageHint ?? ""}`;

    if (seen.has(dedupeKey)) {
      continue;
    }

    normalizedCitations.push({
      source_id: source.id,
      title: source.title,
      authority: source.authority,
      url: source.remote_url,
      page_hint: pageHint,
      excerpt,
    });
    seen.add(dedupeKey);
  }

  if (normalizedCitations.length > 0) {
    return normalizedCitations;
  }

  for (const [sourceId, retrievedMatches] of retrievedSourceMatches) {
    const source = authoritativeSourceMap.get(sourceId);

    if (!source || seen.has(sourceId)) {
      continue;
    }

    normalizedCitations.push({
      source_id: source.id,
      title: source.title,
      authority: source.authority,
      url: source.remote_url,
      page_hint: null,
      excerpt: retrievedMatches[0]?.excerpt ?? null,
    });
    seen.add(sourceId);
  }

  return normalizedCitations;
}

export async function generateChatResponse({
  question,
  imageDataUrl,
}: ChatInput): Promise<ChatResponse> {
  const config = getServerConfig();

  if (!config.OPENAI_API_KEY) {
    throw errorBodySchema.parse({
      code: "OPENAI_API_KEY_MISSING",
      message: "OPENAI_API_KEY is not configured.",
      retryable: false,
    });
  }

  if (!config.OPENAI_VECTOR_STORE_ID) {
    throw errorBodySchema.parse({
      code: "VECTOR_STORE_NOT_CONFIGURED",
      message: "OPENAI_VECTOR_STORE_ID is not configured.",
      retryable: false,
    });
  }

  const client = getOpenAIClient();
  const sources = getAuthoritativeSources();
  const authoritativeSourceMap = getAuthoritativeSourceMap();
  const input: ResponseInput = [
    {
      type: "message",
      role: "developer",
      content: [
        {
          type: "input_text",
          text: buildSystemPrompt(sources),
        },
      ],
    },
    {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: buildUserPrompt(question, config.APP_REGION_NAME),
        },
        ...(imageDataUrl
          ? [
              {
                type: "input_image" as const,
                image_url: imageDataUrl,
                detail: "auto" as const,
              },
            ]
          : []),
      ],
    },
  ];

  const response = await client.responses.parse({
    model: config.OPENAI_MODEL,
    input,
    tools: [
      {
        type: "file_search",
        vector_store_ids: [config.OPENAI_VECTOR_STORE_ID],
        max_num_results: config.OPENAI_FILE_SEARCH_MAX_RESULTS,
      },
    ],
    include: ["file_search_call.results"],
    text: {
      format: zodTextFormat(modelChatResponseSchema, "eco_guide_response"),
    },
  });

  const parsed = modelChatResponseSchema.parse(response.output_parsed);
  const retrievedSourceMatches = collectRetrievedSourceMatches(
    response.output,
    authoritativeSourceMap,
  );

  return {
    ...parsed,
    citations: normalizeCitations(
      parsed.citations,
      retrievedSourceMatches,
      authoritativeSourceMap,
    ),
    request_id: response.id ?? randomUUID(),
  };
}
