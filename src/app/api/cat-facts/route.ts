import { NextResponse } from "next/server";
import { ApiUsageLimitError } from "@/lib/api-key-limits";
import { getApiRouteErrorMessage } from "@/lib/api-route-errors";
import {
  assertCanMakeApiCallout,
  extractApiKeyFromRequest,
  incrementApiKeyUsage,
  verifyApiKeyByValue,
} from "@/lib/api-keys-store";

type ApiErrorCode = "MISSING_API_KEY" | "INVALID_API_KEY" | "USAGE_LIMIT_EXCEEDED";

function apiError(
  code: ApiErrorCode,
  error: string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ error, code, ...extra }, { status });
}

export async function GET(request: Request) {
  try {
    const apiKey = extractApiKeyFromRequest(request);

    if (!apiKey) {
      return apiError(
        "MISSING_API_KEY",
        "No API key provided. Add the x-api-key header or Authorization: Bearer sk_... with your key from the dashboard.",
        401,
      );
    }

    const verified = await verifyApiKeyByValue(apiKey);
    if (!verified.valid) {
      return apiError(
        "INVALID_API_KEY",
        "API key is invalid or has been deleted. Create a new key in the dashboard or copy the correct sk_... value.",
        401,
      );
    }

    if (!verified.userId) {
      return apiError(
        "INVALID_API_KEY",
        "This API key is not linked to a user account. Sign in and create a new key from the dashboard.",
        401,
      );
    }

    await assertCanMakeApiCallout(verified.userId);

    const upstream = await fetch("https://catfact.ninja/fact", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error:
            "Could not reach the cat facts service right now. Please try again in a moment.",
          code: "UPSTREAM_ERROR",
        },
        { status: 502 },
      );
    }

    const fact = (await upstream.json()) as { fact: string; length: number };
    const usage = await incrementApiKeyUsage(apiKey);

    return NextResponse.json({
      ...fact,
      keyName: verified.name,
      usage,
    });
  } catch (error) {
    if (error instanceof ApiUsageLimitError) {
      return apiError("USAGE_LIMIT_EXCEEDED", error.message, 429, {
        totalUsage: error.totalUsage,
        limit: error.limit,
      });
    }

    console.error("GET /api/cat-facts failed:", error);
    return NextResponse.json(
      { error: getApiRouteErrorMessage(error, "Failed to fetch cat fact") },
      { status: 500 },
    );
  }
}
