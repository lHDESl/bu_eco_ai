import { z } from "zod";

const serverConfigSchema = z.object({
  OPENAI_API_KEY: z.string().trim().min(1).optional(),
  OPENAI_MODEL: z.string().trim().min(1).default("gpt-5.4"),
  OPENAI_FALLBACK_MODEL: z.string().trim().min(1).default("gpt-5-mini"),
  OPENAI_VECTOR_STORE_ID: z.string().trim().min(1).optional(),
  OPENAI_FILE_SEARCH_MAX_RESULTS: z.coerce.number().int().positive().default(6),
  APP_REGION_CODE: z.string().trim().min(1).default("cheonan-si"),
  APP_REGION_NAME: z.string().trim().min(1).default("천안시"),
  NEXT_PUBLIC_APP_NAME: z.string().trim().min(1).default("EcoGuide AI"),
  NEXT_PUBLIC_APP_REGION_LABEL: z.string().trim().min(1).default("천안시"),
});

export type ServerConfig = z.infer<typeof serverConfigSchema>;

let cachedConfig: ServerConfig | null = null;

export function getServerConfig(): ServerConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = serverConfigSchema.parse(process.env);
  return cachedConfig;
}

export function getPublicAppConfig() {
  const config = getServerConfig();

  return {
    appName: config.NEXT_PUBLIC_APP_NAME,
    regionLabel: config.NEXT_PUBLIC_APP_REGION_LABEL,
  };
}

export function getRuntimeReadiness() {
  const config = getServerConfig();

  return {
    service: config.NEXT_PUBLIC_APP_NAME,
    region: config.APP_REGION_CODE,
    checks: {
      openai_api_key: Boolean(config.OPENAI_API_KEY),
      vector_store_id: Boolean(config.OPENAI_VECTOR_STORE_ID),
    },
  };
}
