import { z } from "zod";

export const citationSchema = z.object({
  source_id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  authority: z.string().trim().min(1),
  url: z.union([z.url(), z.null()]),
  page_hint: z.union([z.string().trim(), z.null()]),
  excerpt: z.union([z.string().trim(), z.null()]),
});

export const chatResponseSchema = z.object({
  decision: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  prep_steps: z.array(z.string().trim().min(1)).default([]),
  citations: z.array(citationSchema).default([]),
  needs_clarification: z.boolean(),
  follow_up_question: z.union([z.string().trim(), z.null()]),
  request_id: z.string().trim().min(1),
});

export const errorBodySchema = z.object({
  code: z.enum([
    "INVALID_REQUEST",
    "UNSUPPORTED_FILE_TYPE",
    "FILE_TOO_LARGE",
    "OPENAI_API_KEY_MISSING",
    "VECTOR_STORE_NOT_CONFIGURED",
    "UPSTREAM_OPENAI_ERROR",
    "INTERNAL_SERVER_ERROR",
  ]),
  message: z.string().trim().min(1),
  retryable: z.boolean(),
});

export const errorEnvelopeSchema = z.object({
  error: errorBodySchema,
});

export const healthResponseSchema = z.object({
  service: z.string().trim().min(1),
  status: z.enum(["ok", "degraded"]),
  region: z.string().trim().min(1),
  checks: z.object({
    openai_api_key: z.boolean(),
    vector_store_id: z.boolean(),
  }),
});

export type Citation = z.infer<typeof citationSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type ErrorBody = z.infer<typeof errorBodySchema>;
