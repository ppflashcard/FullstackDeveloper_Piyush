"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Plan = "free" | "pro" | "custom";

const PLANS: {
  id: Plan;
  name: string;
  price: string;
  description: string;
  features: string[];
}[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Get started with core API access.",
    features: [
      "1,000 API credits per month",
      "Up to 10 active API keys",
      "Playground and documentation",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    description: "For growing products and teams.",
    features: [
      "25,000 API credits per month",
      "Priority support",
      "Usage analytics",
      "Faster rate limits",
    ],
  },
  {
    id: "custom",
    name: "Custom",
    price: "Talk to us",
    description: "Volume pricing and dedicated help.",
    features: [
      "Unlimited credits",
      "SLA and dedicated support",
      "SSO and security review",
      "Custom integrations",
    ],
  },
];

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<"plan" | "details">("plan");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function selectPlan(next: Plan) {
    setPlan(next);
    setStep("details");
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plan) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          plan,
          ...(plan !== "free"
            ? { cardName, cardNumber, cardExpiry, cardCvc }
            : {}),
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error || "Could not create account.");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Account created, but sign-in failed. Please log in.");
        setLoading(false);
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (step === "plan") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            Choose your plan
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Free creates your account right away. Pro and Custom collect card
            details only — no charge validation.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
          {PLANS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectPlan(item.id)}
              className={cn(
                "flex h-full min-h-[280px] flex-col rounded-2xl border p-5 text-left transition-all hover:border-orange-400 hover:shadow-md",
                "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900",
              )}
            >
              <p className="text-sm font-medium uppercase tracking-wide text-orange-600">
                {item.name}
              </p>
              <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-50">
                {item.price}
                {item.id !== "custom" ? (
                  <span className="text-sm font-normal text-stone-400">
                    /mo
                  </span>
                ) : null}
              </p>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                {item.description}
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-600 marker:text-orange-500 dark:text-stone-300">
                {item.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const selected = PLANS.find((p) => p.id === plan);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            Create your {selected?.name} account
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {plan === "free"
              ? "We’ll create your user record and open the dashboard."
              : "Enter account and card details to continue."}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setStep("plan");
            setError(null);
          }}
        >
          Change plan
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="signup-name"
            className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Name
          </label>
          <Input
            id="signup-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Developer"
            required
          />
        </div>
        <div>
          <label
            htmlFor="signup-email"
            className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Email
          </label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />
        </div>
        <div>
          <label
            htmlFor="signup-password"
            className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Password
          </label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      {plan !== "free" ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-950/50">
          <p className="mb-3 text-sm font-medium text-stone-800 dark:text-stone-200">
            Credit card details
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="card-name"
                className="mb-1.5 block text-sm text-stone-600 dark:text-stone-400"
              >
                Name on card
              </label>
              <Input
                id="card-name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Alex Developer"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="card-number"
                className="mb-1.5 block text-sm text-stone-600 dark:text-stone-400"
              >
                Card number
              </label>
              <Input
                id="card-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
              />
            </div>
            <div>
              <label
                htmlFor="card-expiry"
                className="mb-1.5 block text-sm text-stone-600 dark:text-stone-400"
              >
                Expiry
              </label>
              <Input
                id="card-expiry"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label
                htmlFor="card-cvc"
                className="mb-1.5 block text-sm text-stone-600 dark:text-stone-400"
              >
                CVC
              </label>
              <Input
                id="card-cvc"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                placeholder="123"
              />
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading
          ? "Creating account..."
          : plan === "free"
            ? "Create free account"
            : "Continue"}
      </Button>
    </form>
  );
}
