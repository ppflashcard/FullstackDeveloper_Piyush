import Link from "next/link";
import { CredentialsSignInForm } from "@/components/auth/credentials-sign-in-form";
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
          <Link href="/" className="inline-block">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-lg font-bold text-white shadow-lg shadow-orange-500/30">
              F
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              fullstack
            </h1>
          </Link>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Sign in to manage your API keys and usage.
          </p>
        </div>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Sign in with email and password, or continue with Google.
          </p>

          <div className="mt-6">
            <CredentialsSignInForm callbackUrl={callbackUrl} />
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
            <span className="text-xs uppercase tracking-wide text-stone-400">
              or
            </span>
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
          </div>

          <GoogleSignInButton callbackUrl={callbackUrl} />

          <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
            New here?{" "}
            <Link
              href="/signup"
              className="font-medium text-orange-600 hover:text-orange-700"
            >
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
