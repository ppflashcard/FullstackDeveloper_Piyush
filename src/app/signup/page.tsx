import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export default function SignupPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-100 px-4 py-12 dark:bg-stone-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249,115,22,0.22), transparent), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(251,146,60,0.12), transparent)",
        }}
      />

      <div className="relative mx-auto w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
              F
            </span>
            <span className="text-lg font-semibold text-stone-900 dark:text-stone-50">
              fullstack
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-stone-600 hover:text-orange-600 dark:text-stone-300"
          >
            Already have an account? Log in
          </Link>
        </div>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
          <SignupForm />

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
            <span className="text-xs uppercase tracking-wide text-stone-400">
              or
            </span>
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
          </div>

          <GoogleSignInButton callbackUrl="/dashboard" />
        </section>
      </div>
    </main>
  );
}
