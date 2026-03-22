import { NextResponse } from "next/server";
import { getRuntimeReadiness } from "@/lib/config";
import { healthResponseSchema } from "@/lib/contracts";

export const runtime = "nodejs";

export async function GET() {
  const readiness = getRuntimeReadiness();
  const status =
    readiness.checks.openai_api_key && readiness.checks.vector_store_id
      ? "ok"
      : "degraded";

  const payload = healthResponseSchema.parse({
    service: readiness.service,
    status,
    region: readiness.region,
    checks: readiness.checks,
  });

  return NextResponse.json(payload);
}
