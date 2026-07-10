import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireUserId(): Promise<
  { userId: string } | { error: NextResponse }
> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      error: NextResponse.json(
        { error: "You must be signed in to manage API keys.", code: "UNAUTHORIZED" },
        { status: 401 },
      ),
    };
  }

  return { userId };
}
