"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

type GoogleSignInButtonProps = {
  callbackUrl?: string;
};

export function GoogleSignInButton({
  callbackUrl = "/dashboard",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      disabled={loading}
      onClick={() => void handleSignIn()}
    >
      <GoogleIcon className="h-5 w-5" />
      {loading ? "Redirecting to Google..." : "Continue with Google"}
    </Button>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M21.35 11.1h-9.17v2.92h5.3c-.23 1.25-.93 2.3-1.98 3.01v2.5h3.2c1.87-1.72 2.95-4.26 2.95-7.27 0-.7-.06-1.38-.2-2.03z"
        opacity="0.9"
      />
      <path
        fill="currentColor"
        d="M12.18 22c2.67 0 4.91-.88 6.55-2.39l-3.2-2.5c-.89.6-2.03.95-3.35.95-2.57 0-4.75-1.74-5.53-4.07H3.35v2.58C5 19.98 8.35 22 12.18 22z"
        opacity="0.75"
      />
      <path
        fill="currentColor"
        d="M6.65 13.99A5.99 5.99 0 016.34 12c0-.69.12-1.36.31-1.99V7.43H3.35A9.98 9.98 0 002.18 12c0 1.61.39 3.14 1.17 4.57l3.3-2.58z"
        opacity="0.85"
      />
      <path
        fill="currentColor"
        d="M12.18 5.94c1.45 0 2.75.5 3.78 1.48l2.83-2.83C16.08 2.95 14.84 2 12.18 2 8.35 2 5 4.02 3.35 7.43l3.3 2.58c.78-2.33 2.96-4.07 5.53-4.07z"
        opacity="0.95"
      />
    </svg>
  );
}
