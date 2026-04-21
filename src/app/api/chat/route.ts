import { errorResponse } from "@/lib/api-errors";
import { errorBodySchema } from "@/lib/contracts";
import { generateChatResponse } from "@/lib/openai/chat";

export const runtime = "nodejs";
export const maxDuration = 60;

const SUPPORTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

function toDataUrl(file: File, bytes: Buffer) {
  return `data:${file.type};base64,${bytes.toString("base64")}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const question = formData.get("question");

    if (typeof question !== "string" || question.trim().length === 0) {
      return errorResponse(
        errorBodySchema.parse({
          code: "INVALID_REQUEST",
          message: "질문 내용을 입력해 주세요.",
          retryable: false,
        }),
        400,
      );
    }

    const image = formData.get("image");
    let imageDataUrl: string | undefined;

    if (image instanceof File && image.size > 0) {
      if (!SUPPORTED_IMAGE_TYPES.has(image.type)) {
        return errorResponse(
          errorBodySchema.parse({
            code: "UNSUPPORTED_FILE_TYPE",
            message: "PNG, JPG, WEBP 형식의 이미지만 업로드할 수 있습니다.",
            retryable: false,
          }),
          400,
        );
      }

      if (image.size > MAX_IMAGE_SIZE_BYTES) {
        return errorResponse(
          errorBodySchema.parse({
            code: "FILE_TOO_LARGE",
            message: "이미지 크기는 8MB 이하여야 합니다.",
            retryable: false,
          }),
          400,
        );
      }

      const bytes = Buffer.from(await image.arrayBuffer());
      imageDataUrl = toDataUrl(image, bytes);
    }

    const response = await generateChatResponse({
      question: question.trim(),
      imageDataUrl,
    });

    return Response.json(response);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error &&
      "retryable" in error
    ) {
      return errorResponse(errorBodySchema.parse(error), 503);
    }

    return errorResponse(
      errorBodySchema.parse({
        code: "UPSTREAM_OPENAI_ERROR",
        message: "OpenAI 응답 생성에 실패했습니다. API 키와 vector store 연결 상태를 확인해 주세요.",
        retryable: true,
      }),
      503,
    );
  }
}
