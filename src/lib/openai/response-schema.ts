import { z } from "zod";
import { chatResponseSchema } from "../contracts";

export const modelChatResponseSchema = chatResponseSchema.omit({
  request_id: true,
});

export type ModelChatResponse = z.infer<typeof modelChatResponseSchema>;
