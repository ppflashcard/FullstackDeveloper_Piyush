export function getApiRouteErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    if (error.message.includes("Missing Supabase env vars")) {
      return "Supabase is not configured. Add credentials to .env.local and restart the dev server.";
    }

    if (error.message.includes("user_id")) {
      return error.message;
    }

    if (error.message.includes("Database error")) {
      return error.message.includes(": ")
        ? error.message
        : "Database error. Ensure the api_keys table exists in Supabase (run supabase/migrations/001_api_keys.sql).";
    }

    return error.message || fallback;
  }

  return fallback;
}
