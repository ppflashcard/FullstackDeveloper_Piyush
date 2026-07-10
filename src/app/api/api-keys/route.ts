import { NextResponse } from "next/server";
import { ApiKeyLimitError } from "@/lib/api-key-limits";
import { getApiRouteErrorMessage } from "@/lib/api-route-errors";
import { createApiKey, listApiKeys } from "@/lib/api-keys-store";
import { requireUserId } from "@/lib/require-user";
import type { CreateApiKeyInput } from "@/types/api-key";

export async function GET() {
  try {
    const result = await requireUserId();
    if ("error" in result) return result.error;

    const keys = await listApiKeys(result.userId);
    return NextResponse.json(keys);
  } catch (error) {
    console.error("GET /api/api-keys failed:", error);
    return NextResponse.json(
      { error: getApiRouteErrorMessage(error, "Failed to load API keys") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireUserId();
    if ("error" in result) return result.error;

    let body: CreateApiKeyInput;

    try {
      body = (await request.json()) as CreateApiKeyInput;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const apiKey = await createApiKey(body, result.userId);
    return NextResponse.json(apiKey, { status: 201 });
  } catch (error) {
    if (error instanceof ApiKeyLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    console.error("POST /api/api-keys failed:", error);
    return NextResponse.json(
      { error: getApiRouteErrorMessage(error, "Failed to create API key") },
      { status: 500 },
    );
  }
}
