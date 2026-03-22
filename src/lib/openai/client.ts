import OpenAI from "openai";
import { getServerConfig } from "../config";

let cachedClient: OpenAI | null = null;

export function getOpenAIClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const config = getServerConfig();

  if (!config.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY_MISSING");
  }

  cachedClient = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
  });

  return cachedClient;
}
