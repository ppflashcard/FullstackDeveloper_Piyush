import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl =
    params.callbackUrl?.startsWith("/") && !params.callbackUrl.startsWith("//")
      ? params.callbackUrl
      : "/dashboard";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-100 px-4 dark:bg-stone-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249,115,22,0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(251,146,60,0.15), transparent)",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-lg font-bold text-white shadow-lg shadow-orange-500/30">
            F
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            fullstack
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Sign in to manage your API keys and usage.
          </p>
        </div>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Use your Google account to continue. Your API keys stay private to
            your account.
          </p>

          <div className="mt-6">
            <GoogleSignInButton callbackUrl={callbackUrl} />
          </div>

          <p className="mt-6 text-center text-xs text-stone-400 dark:text-stone-500">
            By continuing, you agree to use this workspace for your own API keys
            only.
          </p>
        </section>
      </div>
    </main>
  );
}
