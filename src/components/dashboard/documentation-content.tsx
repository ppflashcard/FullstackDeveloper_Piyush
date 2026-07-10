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
      "Requires your API key in the x-api-key header (or Authorization: Bearer). Only works if the key owner exists in the users database. Proxies to catfact.ninja and increments usage on each successful call.",
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

// Wrong / invalid key (401)
{
  "error": "API key is invalid or has been deleted. Create a new key in the dashboard or copy the correct sk_... value.",
  "code": "INVALID_API_KEY"
}

// Key exists but user is not in the database (403)
{
  "error": "This API key belongs to a user that does not exist in the database. Sign up or sign in again so your account is saved, then create a new API key.",
  "code": "USER_NOT_FOUND"
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

type EasyTestCase = {
  title: string;
  whatYouNeed: string;
  steps: string[];
  expectSuccess: boolean;
  whatYouShouldSee: string;
};

const EASY_TEST_CASES: EasyTestCase[] = [
  {
    title: "Test 1 — Valid user with a real API key (should work)",
    whatYouNeed:
      "An account you created with Sign up (Free plan is fine), and one API key from the Overview page.",
    steps: [
      "Open the website and click Sign up (or Log in if you already have an account).",
      "After you reach the dashboard, stay on Overview.",
      "Click Create API Key, give it any name (for example: My Test Key), and create it.",
      "Copy the full key. It starts with sk_. Keep it somewhere safe — you only see the full key once.",
      "Open API Playground from the left menu.",
      "Paste your key into the API Key box.",
      "Click the button to fetch a cat fact.",
    ],
    expectSuccess: true,
    whatYouShouldSee:
      "A green success message and a cat fact on the screen. On Overview, that key’s usage number should go up by 1.",
  },
  {
    title: "Test 2 — No API key (should fail)",
    whatYouNeed: "Just the API Playground page. You do not need a key for this test.",
    steps: [
      "Open API Playground from the left menu.",
      "Leave the API Key box empty.",
      "Click the button to fetch a cat fact.",
    ],
    expectSuccess: false,
    whatYouShouldSee:
      "A red error message saying no API key was provided. You should not get a cat fact.",
  },
  {
    title: "Test 3 — Wrong API key (should fail)",
    whatYouNeed: "The API Playground page only.",
    steps: [
      "Open API Playground from the left menu.",
      "In the API Key box, type something fake, for example: sk_this_is_wrong",
      "Click the button to fetch a cat fact.",
    ],
    expectSuccess: false,
    whatYouShouldSee:
      "A red error message saying the API key is invalid or has been deleted. You should not get a cat fact.",
  },
  {
    title: "Test 4 — Key exists but the user is not in the database (should fail)",
    whatYouNeed:
      "This is an advanced check. Normally you will not hit this if you signed up properly. It means the key is in the system, but the owner account is missing from the users table.",
    steps: [
      "If you somehow have an old key from before accounts were saved in the database, paste that key in API Playground.",
      "Click the button to fetch a cat fact.",
      "If you do not have such a key, you can skip this test — it is already covered by our automated checks.",
    ],
    expectSuccess: false,
    whatYouShouldSee:
      "A red error message saying the user does not exist in the database. Sign up or log in again, then create a new API key.",
  },
];

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

        <section id="where-to-put-things" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Where to put the API key, headers, and body
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Think of every API call as three parts: the address (URL), optional
              labels (headers), and optional message content (body). Below is exactly
              where each piece goes.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-800 sm:px-6">
              <h3 className="text-base font-semibold">1. The URL (address)</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                This is the full link you call. Put it in the address bar of Postman
                (or the URL field of any API tool).
              </p>
            </div>
            <div className="space-y-3 p-5 text-sm text-stone-700 dark:text-stone-300 sm:p-6">
              <p>
                Example for a cat fact:{" "}
                <code className="break-all font-mono text-orange-600 dark:text-orange-400">
                  {baseUrl}/api/cat-facts
                </code>
              </p>
              <p>
                Example to verify a key:{" "}
                <code className="break-all font-mono text-orange-600 dark:text-orange-400">
                  {baseUrl}/api/api-keys/verify
                </code>
              </p>
              <p className="text-stone-500 dark:text-stone-400">
                Also choose the method next to the URL: use <strong>GET</strong> for
                cat facts, and <strong>POST</strong> when the docs show a request body.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-800 sm:px-6">
              <h3 className="text-base font-semibold">2. The API key (most important)</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Your key looks like <code className="font-mono">sk_...</code>. It proves
                who you are. Do <strong>not</strong> put it in the URL. Put it in a
                header (or in the Playground box).
              </p>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <Callout variant="success" title="Option A — Inside this website (easiest)">
                <ol className="list-decimal space-y-1.5 pl-5">
                  <li>Go to <strong>API Playground</strong> in the left menu.</li>
                  <li>
                    Find the field labeled <strong>API Key</strong>.
                  </li>
                  <li>
                    Paste your full key there (starts with <code className="font-mono">sk_</code>).
                  </li>
                  <li>Click the fetch button. The site adds the header for you.</li>
                </ol>
              </Callout>

              <Callout variant="info" title="Option B — In Postman (Headers tab)">
                <ol className="list-decimal space-y-1.5 pl-5">
                  <li>Open Postman and create a new request.</li>
                  <li>
                    Set method to <strong>GET</strong> and URL to{" "}
                    <code className="font-mono break-all">
                      {baseUrl}/api/cat-facts
                    </code>
                    .
                  </li>
                  <li>
                    Click the <strong>Headers</strong> tab (not Params, not Body).
                  </li>
                  <li>
                    Add a new row:
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>
                        <strong>Key</strong> (left column):{" "}
                        <code className="font-mono">x-api-key</code>
                      </li>
                      <li>
                        <strong>Value</strong> (right column): your full key, e.g.{" "}
                        <code className="font-mono">sk_abc123...</code>
                      </li>
                    </ul>
                  </li>
                  <li>Click <strong>Send</strong>.</li>
                </ol>
                <p className="mt-3 text-stone-600 dark:text-stone-400">
                  Alternate header (same meaning): Key ={" "}
                  <code className="font-mono">Authorization</code>, Value ={" "}
                  <code className="font-mono">Bearer sk_abc123...</code> (include the
                  word Bearer, then a space, then your key).
                </p>
              </Callout>

              <div className="rounded-xl bg-stone-950 p-4 text-xs leading-relaxed text-stone-100">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                  Header example (what Postman is sending)
                </p>
                <pre className="overflow-x-auto font-mono">{`x-api-key: sk_your_full_key_here`}</pre>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-800 sm:px-6">
              <h3 className="text-base font-semibold">3. Other headers (when needed)</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Headers are name/value pairs. You add them in Postman under the{" "}
                <strong>Headers</strong> tab, one row per header.
              </p>
            </div>
            <div className="overflow-x-auto p-5 sm:p-6">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500 dark:border-stone-700 dark:text-stone-400">
                    <th className="pb-2 pr-4 font-semibold">Header name</th>
                    <th className="pb-2 pr-4 font-semibold">Header value</th>
                    <th className="pb-2 font-semibold">When to use</th>
                  </tr>
                </thead>
                <tbody className="text-stone-700 dark:text-stone-300">
                  <tr className="border-b border-stone-100 dark:border-stone-800">
                    <td className="py-3 pr-4 font-mono text-xs">x-api-key</td>
                    <td className="py-3 pr-4 font-mono text-xs">sk_...</td>
                    <td className="py-3">Cat fact callout (required)</td>
                  </tr>
                  <tr className="border-b border-stone-100 dark:border-stone-800">
                    <td className="py-3 pr-4 font-mono text-xs">Authorization</td>
                    <td className="py-3 pr-4 font-mono text-xs">Bearer sk_...</td>
                    <td className="py-3">Same as x-api-key (pick one)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-xs">Content-Type</td>
                    <td className="py-3 pr-4 font-mono text-xs">application/json</td>
                    <td className="py-3">
                      Only for POST/PUT when you send a body (Postman often adds this
                      for you)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-800 sm:px-6">
              <h3 className="text-base font-semibold">4. The body (only for some requests)</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                The body is the JSON message you send. Cat facts use <strong>GET</strong>{" "}
                — leave the body empty. Use a body only when the docs show a “Request
                body” example (for example, verify key).
              </p>
            </div>
            <div className="space-y-4 p-5 text-sm text-stone-700 dark:text-stone-300 sm:p-6">
              <Callout variant="warning" title="Cat fact callout — no body">
                Method = <strong>GET</strong>. Headers = your API key. Body tab = leave
                empty / do not send.
              </Callout>

              <div>
                <p className="mb-2 font-medium text-stone-900 dark:text-stone-100">
                  Example: verify an API key in Postman
                </p>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    Method: <strong>POST</strong>
                  </li>
                  <li>
                    URL:{" "}
                    <code className="break-all font-mono text-orange-600 dark:text-orange-400">
                      {baseUrl}/api/api-keys/verify
                    </code>
                  </li>
                  <li>
                    Open the <strong>Body</strong> tab → choose <strong>raw</strong> →
                    choose <strong>JSON</strong> from the dropdown on the right.
                  </li>
                  <li>Paste this into the body editor:</li>
                </ol>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-stone-950 p-4 text-xs leading-relaxed text-stone-100">
                  {`{
  "key": "sk_your_full_key_here"
}`}
                </pre>
                <p className="mt-3 text-stone-500 dark:text-stone-400">
                  Then click <strong>Send</strong>. You should get back whether the key
                  is valid.
                </p>
              </div>
            </div>
          </div>

          <Callout variant="tip" title="Quick memory aid">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>URL</strong> = where to send the request
              </li>
              <li>
                <strong>Headers</strong> = where the API key goes (
                <code className="font-mono">x-api-key</code>)
              </li>
              <li>
                <strong>Body</strong> = JSON only when the docs show a request body
                (not for GET cat facts)
              </li>
              <li>
                <strong>Playground</strong> = paste the key in the box; no headers or
                body to worry about
              </li>
            </ul>
          </Callout>
        </section>

        <section id="easy-tests" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Easy test checklist (no coding needed)
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Follow these steps one by one. You only need the website, your mouse, and
              copy-paste. Each test tells you what should happen.
            </p>
          </div>

          <Callout variant="info" title="Before you start">
            <ol className="list-decimal space-y-1.5 pl-5">
              <li>Open the app in your browser (for local: http://localhost:3000).</li>
              <li>Create an account with Sign up, or Log in if you already have one.</li>
              <li>
                You will use two pages: <strong>Overview</strong> (to create a key) and{" "}
                <strong>API Playground</strong> (to test the callout).
              </li>
            </ol>
          </Callout>

          <div className="space-y-4">
            {EASY_TEST_CASES.map((testCase, index) => (
              <article
                key={testCase.title}
                id={`easy-test-${index + 1}`}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-800 sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        testCase.expectSuccess
                          ? "rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300"
                      }
                    >
                      {testCase.expectSuccess ? "Should succeed" : "Should fail"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{testCase.title}</h3>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      What you need:{" "}
                    </span>
                    {testCase.whatYouNeed}
                  </p>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                      Steps
                    </p>
                    <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                      {testCase.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <Callout
                    variant={testCase.expectSuccess ? "success" : "warning"}
                    title="What you should see"
                  >
                    {testCase.whatYouShouldSee}
                  </Callout>
                </div>
              </article>
            ))}
          </div>

          <Callout variant="tip" title="Quick results cheat sheet">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Valid user + real key</strong> → cat fact appears (success)
              </li>
              <li>
                <strong>Empty key</strong> → “No API key provided”
              </li>
              <li>
                <strong>Wrong key</strong> → “API key is invalid or has been deleted”
              </li>
              <li>
                <strong>Key with missing user</strong> → “user that does not exist in the
                database”
              </li>
            </ul>
          </Callout>
        </section>

        <section id="api-reference" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">API Reference</h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              For developers and tools like Postman. All write endpoints expect{" "}
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
              <li>
                Create a key on the <strong>Overview</strong> page and copy the full{" "}
                <code className="font-mono">sk_...</code> value.
              </li>
              <li>
                In Postman: method <strong>GET</strong>, URL{" "}
                <code className="font-mono break-all">{baseUrl}/api/cat-facts</code>
              </li>
              <li>
                Open the <strong>Headers</strong> tab. Add{" "}
                <code className="font-mono">x-api-key</code> = your key. Do not put the
                key in Params or Body.
              </li>
              <li>
                Leave <strong>Body</strong> empty. Click <strong>Send</strong>.
              </li>
              <li>
                Each successful response increments that key&apos;s usage on Overview.
              </li>
            </ol>
            <p className="mt-3">
              Need more detail? See{" "}
              <a
                href="#where-to-put-things"
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                Where to put the API key, headers, and body
              </a>{" "}
              above.
            </p>
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
            {`# Valid key (expect a cat fact)
curl ${baseUrl}/api/cat-facts \\
  -H "x-api-key: sk_your_real_key_here"

# Missing key (expect MISSING_API_KEY)
curl ${baseUrl}/api/cat-facts

# Wrong key (expect INVALID_API_KEY)
curl ${baseUrl}/api/cat-facts \\
  -H "x-api-key: sk_this_is_wrong"`}
          </pre>
        </section>
      </div>
    </>
  );
}
