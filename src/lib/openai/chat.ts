import { randomUUID } from "node:crypto";
import { zodTextFormat } from "openai/helpers/zod";
import type { ResponseInput } from "openai/resources/responses/responses";
import { errorBodySchema, type ChatResponse } from "../contracts";
import { getServerConfig } from "../config";
import { getAuthoritativeSources } from "../source-catalog";
import { getOpenAIClient } from "./client";
import { buildSystemPrompt, buildUserPrompt } from "./prompt";
import { modelChatResponseSchema } from "./response-schema";

type ChatInput = {
  question: string;
  imageDataUrl?: string;
};

function normalizeCitations(citations: ChatResponse["citations"]) {
  return citations.filter((citation) => {
    return (
      citation.source_id &&
      citation.title &&
      citation.authority &&
      (citation.url === null || citation.url.startsWith("http"))
    );
  });
}

export async function generateChatResponse({
  question,
  imageDataUrl,
}: ChatInput): Promise<ChatResponse> {
  const config = getServerConfig();

  if (!config.OPENAI_API_KEY) {
    throw errorBodySchema.parse({
      code: "OPENAI_API_KEY_MISSING",
      message: "OPENAI API 키가 설정되지 않았습니다.",
      retryable: false,
    });
  }

  if (!config.OPENAI_VECTOR_STORE_ID) {
    throw errorBodySchema.parse({
      code: "VECTOR_STORE_NOT_CONFIGURED",
      message: "OpenAI vector store ID가 설정되지 않았습니다.",
      retryable: false,
    });
  }

  const client = getOpenAIClient();
  const sources = getAuthoritativeSources();
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

  return {
    ...parsed,
    citations: normalizeCitations(parsed.citations),
    request_id: response.id ?? randomUUID(),
  };
}
