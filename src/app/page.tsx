import Link from "next/link";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    blurb: "Ship prototypes and personal projects.",
    features: [
      "1,000 API credits per month",
      "Up to 10 active API keys",
      "Playground and documentation access",
      "Community support",
      "Email and Google sign-in",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    blurb: "For products that need more room to grow.",
    features: [
      "25,000 API credits per month",
      "Priority email support",
      "Usage insights per API key",
      "Faster rate limits",
      "Card details collected at signup",
    ],
    cta: "Choose Pro",
    highlighted: true,
  },
  {
    name: "Custom",
    price: "Custom",
    period: "",
    blurb: "Volume pricing for teams and platforms.",
    features: [
      "Unlimited API credits",
      "SLA and dedicated support",
      "SSO and security review",
      "Custom integrations",
      "Volume pricing tailored to your team",
    ],
    cta: "Talk to sales",
    highlighted: false,
  },
] as const;

const DETAILS = [
  {
    title: "API keys that stay yours",
    body: "Create, rotate, and revoke keys from one dashboard. Every request is scoped to your account.",
  },
  {
    title: "Playground built in",
    body: "Try endpoints with live callouts before you wire them into production. Same auth, same limits.",
  },
  {
    title: "Clear usage",
    body: "See credit burn per key so you know what is costing you — without digging through logs.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="landing-root min-h-screen text-stone-900">
      <header className="relative z-20 border-b border-white/10 bg-stone-950/40 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white shadow-lg shadow-orange-500/40">
              F
            </span>
            <span className="font-[family-name:var(--font-geist-sans)] text-lg font-semibold tracking-tight text-white">
              fullstack
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-stone-300 md:flex">
            <a href="#overview" className="hover:text-white">
              Overview
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
            <a href="#details" className="hover:text-white">
              Details
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-stone-200 hover:bg-white/10 hover:text-white">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="shadow-lg shadow-orange-500/25">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="landing-hero relative isolate overflow-hidden">
        <div className="landing-hero-bg absolute inset-0" aria-hidden />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
          <p className="landing-fade-up text-sm font-medium uppercase tracking-[0.2em] text-orange-300/90">
            fullstack
          </p>
          <h1 className="landing-fade-up landing-delay-1 mt-4 max-w-3xl font-[family-name:var(--font-geist-sans)] text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
            API keys and usage, without the busywork
          </h1>
          <p className="landing-fade-up landing-delay-2 mt-5 max-w-xl text-lg text-stone-300">
            One workspace to create keys, try endpoints, and watch credits —
            then ship with the same flow in production.
          </p>
          <div className="landing-fade-up landing-delay-3 mt-8 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button size="lg" className="shadow-xl shadow-orange-500/30">
                Sign up
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section
        id="overview"
        className="scroll-mt-20 border-t border-stone-200 bg-stone-50 py-20 dark:border-stone-800 dark:bg-stone-950"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Overview
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
            Everything you need after you authenticate
          </h2>
          <p className="mt-4 max-w-2xl text-stone-600 dark:text-stone-400">
            fullstack gives you a focused dashboard for API keys, a playground
            for live callouts, and billing visibility — the same experience
            whether you sign in with email or Google.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                label: "01",
                title: "Secure sign-in",
                text: "Email and password or Google. Your keys stay private to your account.",
              },
              {
                label: "02",
                title: "Manage keys",
                text: "Create development and production keys, track usage, and revoke anytime.",
              },
              {
                label: "03",
                title: "Call with confidence",
                text: "Use the playground and docs to verify responses before you integrate.",
              },
            ].map((item) => (
              <div key={item.label} className="landing-detail-block">
                <span className="text-xs font-semibold text-orange-500">
                  {item.label}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="scroll-mt-20 border-t border-stone-200 bg-white py-20 dark:border-stone-800 dark:bg-stone-900"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
            Free, Pro, or Custom
          </h2>
          <p className="mt-4 max-w-xl text-stone-600 dark:text-stone-400">
            Start on Free with a real account in the database. Pro and Custom
            collect card details at signup — no payment validation for now.
          </p>

          <div className="mt-12 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.highlighted
                    ? "relative flex h-full min-h-[420px] flex-col rounded-2xl border-2 border-orange-500 bg-stone-950 p-6 text-white shadow-xl shadow-orange-500/15"
                    : "flex h-full min-h-[420px] flex-col rounded-2xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-700 dark:bg-stone-950"
                }
              >
                {plan.highlighted ? (
                  <span className="absolute -top-3 left-6 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-semibold text-white">
                    Popular
                  </span>
                ) : null}
                <h3
                  className={
                    plan.highlighted
                      ? "text-lg font-semibold text-orange-300"
                      : "text-lg font-semibold text-orange-600"
                  }
                >
                  {plan.name}
                </h3>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period ? (
                    <span
                      className={
                        plan.highlighted ? "text-stone-400" : "text-stone-500"
                      }
                    >
                      {plan.period}
                    </span>
                  ) : null}
                </p>
                <p
                  className={
                    plan.highlighted
                      ? "mt-2 text-sm text-stone-300"
                      : "mt-2 text-sm text-stone-600 dark:text-stone-400"
                  }
                >
                  {plan.blurb}
                </p>
                <ul
                  className={
                    plan.highlighted
                      ? "mt-6 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-stone-200 marker:text-orange-400"
                      : "mt-6 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-stone-700 marker:text-orange-500 dark:text-stone-300"
                  }
                >
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Link href="/signup" className="block">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "primary" : "secondary"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="details"
        className="scroll-mt-20 border-t border-stone-200 bg-stone-100 py-20 dark:border-stone-800 dark:bg-stone-950"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Details
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
            Built for the same dashboard you already use
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {DETAILS.map((item) => (
              <article key={item.title}>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-stone-800 bg-stone-950 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Ready to open the dashboard?
            </h2>
            <p className="mt-2 text-stone-400">
              Create a free account or sign in with Google in one click.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup">
              <Button size="lg">Sign up</Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="border-stone-600 bg-transparent text-white hover:bg-stone-800"
              >
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-800 bg-stone-950 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-sm text-stone-500 sm:px-6">
          <span>© {new Date().getFullYear()} fullstack</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-stone-300">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-stone-300">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
