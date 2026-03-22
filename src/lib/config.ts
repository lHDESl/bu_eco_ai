import { z } from "zod";

const optionalNonEmptyString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().trim().min(1).optional());

const sharedConfigSchema = z.object({
  APP_REGION_CODE: z.string().trim().min(1).default("cheonan-si"),
  APP_REGION_NAME: z.string().trim().min(1).default("천안시"),
  NEXT_PUBLIC_APP_NAME: z.string().trim().min(1).default("EcoGuide AI"),
  NEXT_PUBLIC_APP_REGION_LABEL: z.string().trim().min(1).default("천안시"),
});

const serverOnlyConfigSchema = z.object({
  OPENAI_API_KEY: optionalNonEmptyString,
  OPENAI_MODEL: z.string().trim().min(1).default("gpt-5.4"),
  OPENAI_FALLBACK_MODEL: z.string().trim().min(1).default("gpt-5-mini"),
  OPENAI_VECTOR_STORE_ID: optionalNonEmptyString,
  OPENAI_FILE_SEARCH_MAX_RESULTS: z.coerce.number().int().positive().default(6),
});

const serverConfigSchema = sharedConfigSchema.extend(
  serverOnlyConfigSchema.shape,
);
const publicConfigSchema = sharedConfigSchema;

export type ServerConfig = z.infer<typeof serverConfigSchema>;

let cachedConfig: ServerConfig | null = null;
let cachedPublicConfig: z.infer<typeof publicConfigSchema> | null = null;

export function getServerConfig(): ServerConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = serverConfigSchema.parse(process.env);
  return cachedConfig;
}

export function getPublicAppConfig() {
  if (cachedPublicConfig) {
    return {
      appName: cachedPublicConfig.NEXT_PUBLIC_APP_NAME,
      regionLabel: cachedPublicConfig.NEXT_PUBLIC_APP_REGION_LABEL,
    };
  }

  cachedPublicConfig = publicConfigSchema.parse(process.env);

  return {
    appName: cachedPublicConfig.NEXT_PUBLIC_APP_NAME,
    regionLabel: cachedPublicConfig.NEXT_PUBLIC_APP_REGION_LABEL,
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
