import { NextResponse } from "next/server";
import { getApiRouteErrorMessage } from "@/lib/api-route-errors";
import { verifyApiKeyByValue } from "@/lib/api-keys-store";

export async function POST(request: Request) {
  try {
    let body: { key?: string };

    try {
      body = (await request.json()) as { key?: string };
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    if (!body.key?.trim()) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    const result = await verifyApiKeyByValue(body.key);

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: "Key is invalid and not found in the database.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      valid: true,
      name: result.name,
      message: "Key is valid and present in the database.",
    });
  } catch (error) {
    console.error("POST /api/api-keys/verify failed:", error);
    return NextResponse.json(
      { error: getApiRouteErrorMessage(error, "Failed to verify API key") },
      { status: 500 },
    );
  }
}
