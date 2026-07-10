import { NextResponse } from "next/server";
import { getApiRouteErrorMessage } from "@/lib/api-route-errors";
import { deleteApiKey, getApiKey, updateApiKey } from "@/lib/api-keys-store";
import { requireUserId } from "@/lib/require-user";
import type { UpdateApiKeyInput } from "@/types/api-key";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const result = await requireUserId();
    if ("error" in result) return result.error;

    const { id } = await context.params;
    const apiKey = await getApiKey(id, result.userId);

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error("GET /api/api-keys/[id] failed:", error);
    return NextResponse.json(
      { error: getApiRouteErrorMessage(error, "Failed to load API key") },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const result = await requireUserId();
    if ("error" in result) return result.error;

    const { id } = await context.params;
    let body: UpdateApiKeyInput;

    try {
      body = (await request.json()) as UpdateApiKeyInput;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updated = await updateApiKey(id, body, result.userId);

    if (!updated) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/api-keys/[id] failed:", error);
    return NextResponse.json(
      { error: getApiRouteErrorMessage(error, "Failed to update API key") },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const result = await requireUserId();
    if ("error" in result) return result.error;

    const { id } = await context.params;
    const deleted = await deleteApiKey(id, result.userId);

    if (!deleted) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/api-keys/[id] failed:", error);
    return NextResponse.json(
      { error: getApiRouteErrorMessage(error, "Failed to delete API key") },
      { status: 500 },
    );
  }
}
