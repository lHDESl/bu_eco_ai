import { NextResponse } from "next/server";
import type { ErrorBody } from "./contracts";

export function errorResponse(
  error: ErrorBody,
  status: number,
): NextResponse<{ error: ErrorBody }> {
  return NextResponse.json({ error }, { status });
}
