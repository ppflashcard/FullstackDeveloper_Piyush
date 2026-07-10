import { Callout } from "@/components/ui/callout";

type DocumentationContentProps = {
  baseUrl: string;
};

type EndpointDoc = {
  id: string;
  title: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  body?: string;
  response?: string;
};

const ENDPOINTS: EndpointDoc[] = [
  {
    id: "health",
    title: "Health check",
    method: "GET",
    path: "/api/health",
    description: "Quick check that the API is reachable.",
    response: `{
  "message": "Hello from the API",
  "timestamp": "2026-07-10T05:46:03.094Z"
}`,
  },
  {
    id: "list-keys",
    title: "List API keys",
    method: "GET",
    path: "/api/api-keys",
    description: "Returns all API keys (without full secret values).",
  },
  {
    id: "create-key",
    title: "Create API key",
    method: "POST",
    path: "/api/api-keys",
    description: "Creates a new API key. The full key is returned once in the response.",
    body: `{
  "name": "My Postman Key",
  "type": "dev"
}`,
    response: `{
  "id": "uuid",
  "name": "My Postman Key",
  "key": "sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "type": "dev",
  "usage": 0,
  "createdAt": "2026-07-10T05:07:27.928Z",
  "updatedAt": "2026-07-10T05:07:27.928Z"
}`,
  },
  {
    id: "verify-key",
    title: "Verify API key",
    method: "POST",
    path: "/api/api-keys/verify",
    description:
      "Checks whether a key exists in the Supabase api_keys table. Use this from Postman or other external tools.",
    body: `{
  "key": "sk_your_api_key_here"
}`,
    response: `{
  "valid": true,
  "name": "My Postman Key",
  "message": "Key is valid and present in the database."
}`,
  },
  {
    id: "cat-facts",
    title: "Get cat fact (proxied)",
    method: "GET",
    path: "/api/cat-facts",
    description:
      "Requires your API key in the x-api-key header (or Authorization: Bearer). Proxies to catfact.ninja and increments usage on each successful call. Returns 401 if the key is missing or invalid, and 429 when monthly credits are exhausted.",
    response: `{
  "fact": "Cats sleep 70% of their lives.",
  "length": 33,
  "keyName": "My Postman Key",
  "usage": 1
}

// Missing key (401)
{
  "error": "No API key provided. Add the x-api-key header or Authorization: Bearer sk_... with your key from the dashboard.",
  "code": "MISSING_API_KEY"
}

// Invalid key (401)
{
  "error": "API key is invalid or has been deleted. Create a new key in the dashboard or copy the correct sk_... value.",
  "code": "INVALID_API_KEY"
}

// Limit reached (429)
{
  "error": "Monthly API callout limit reached (1,000 / 1,000 credits used). Upgrade your plan or wait for the next billing cycle.",
  "code": "USAGE_LIMIT_EXCEEDED",
  "totalUsage": 1000,
  "limit": 1000
}`,
  },
  {
    id: "get-key",
    title: "Get API key by ID",
    method: "GET",
    path: "/api/api-keys/{id}",
    description: "Returns a single API key record by its ID.",
  },
  {
    id: "update-key",
    title: "Update API key",
    method: "PUT",
    path: "/api/api-keys/{id}",
    description: "Updates the name or type of an existing API key.",
    body: `{
  "name": "Updated Key Name",
  "type": "prod"
}`,
  },
  {
    id: "delete-key",
    title: "Delete API key",
    method: "DELETE",
    path: "/api/api-keys/{id}",
    description: "Permanently deletes an API key.",
    response: `{ "success": true }`,
  },
];

const METHOD_COLORS: Record<EndpointDoc["method"], string> = {
  GET: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  POST: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  PUT: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

export function DocumentationContent({ baseUrl }: DocumentationContentProps) {
  return (
    <>
      <header className="shrink-0 border-b border-stone-200 bg-white px-4 py-4 dark:border-stone-800 dark:bg-stone-900 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Pages /{" "}
            <span className="text-stone-900 dark:text-stone-100">Documentation</span>
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            API Callout Guide
          </h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <Callout variant="tip" title="Base URL for external callouts">
          Use this base URL when calling the API from Postman, curl, or other tools.
          Replace <code className="font-mono text-orange-600 dark:text-orange-400">{`{id}`}</code>{" "}
          placeholders with real values.
          <p className="mt-2 font-mono text-base font-semibold text-stone-900 dark:text-stone-100">
            {baseUrl}
          </p>
        </Callout>

        <section id="api-reference" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">API Reference</h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              All write endpoints expect{" "}
              <code className="text-orange-600 dark:text-orange-400">
                Content-Type: application/json
              </code>
              .
            </p>
          </div>

          <div className="space-y-4">
            {ENDPOINTS.map((endpoint) => (
              <article
                key={endpoint.id}
                id={endpoint.id}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-800 sm:px-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide ${METHOD_COLORS[endpoint.method]}`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="break-all font-mono text-sm text-stone-900 dark:text-stone-100">
                      {baseUrl}
                      {endpoint.path}
                    </code>
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{endpoint.title}</h3>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    {endpoint.description}
                  </p>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  {endpoint.body ? (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                        Request body
                      </p>
                      <pre className="overflow-x-auto rounded-xl bg-stone-950 p-4 text-xs leading-relaxed text-stone-100">
                        {endpoint.body}
                      </pre>
                    </div>
                  ) : null}

                  {endpoint.response ? (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                        Example response
                      </p>
                      <pre className="overflow-x-auto rounded-xl bg-stone-950 p-4 text-xs leading-relaxed text-stone-100">
                        {endpoint.response}
                      </pre>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="postman" className="space-y-4">
          <h2 className="text-lg font-semibold">Postman quick start</h2>

          <Callout variant="info" title="Fetch a cat fact with your API key">
            <ol className="list-decimal space-y-2 pl-5">
              <li>Create a key via the dashboard or POST {baseUrl}/api/api-keys</li>
              <li>Copy the full key value from the response (starts with sk_)</li>
              <li>
                Send GET {baseUrl}/api/cat-facts with header{" "}
                <code className="font-mono">x-api-key: sk_...</code>
              </li>
              <li>Each successful response increments that key&apos;s usage in the dashboard</li>
            </ol>
          </Callout>

          <Callout variant="warning" title="Environment variables">
            Production callouts require Supabase env vars on Vercel:
            NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and
            SUPABASE_SERVICE_ROLE_KEY. Set NEXT_PUBLIC_APP_URL to your public domain if
            you use a custom URL.
          </Callout>
        </section>

        <section id="curl" className="space-y-4">
          <h2 className="text-lg font-semibold">curl examples</h2>
          <pre className="overflow-x-auto rounded-xl bg-stone-950 p-4 text-xs leading-relaxed text-stone-100">
            {`curl ${baseUrl}/api/cat-facts \\
  -H "x-api-key: sk_your_key_here"`}
          </pre>
        </section>
      </div>
    </>
  );
}
