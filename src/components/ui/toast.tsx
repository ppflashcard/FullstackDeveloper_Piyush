"use client";

import { useEffect } from "react";

export type ToastVariant = "success" | "warning" | "error";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
  onClose?: () => void;
  duration?: number;
};

export function Toast({
  message,
  variant = "success",
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose, message]);

  return (
    <div
      role="status"
      className={`toast-pop fixed bottom-6 right-6 z-[70] flex max-w-sm items-center gap-3 rounded-xl border-2 px-5 py-3.5 shadow-xl backdrop-blur-sm ${
        variant === "success"
          ? "border-emerald-400/60 bg-gradient-to-r from-emerald-100 via-green-100 to-emerald-50 shadow-emerald-200/50 dark:border-emerald-600/40 dark:from-emerald-950/90 dark:via-green-950/80 dark:to-emerald-900/70 dark:shadow-emerald-900/30"
          : variant === "warning"
            ? "border-amber-300 bg-amber-50 shadow-amber-200/50 dark:border-amber-700 dark:bg-amber-950/80"
            : "border-red-300 bg-red-50 shadow-red-200/50 dark:border-red-800 dark:bg-red-950/80"
      }`}
    >
      {variant === "success" ? (
        <SuccessIcon className="h-5 w-5 shrink-0 text-orange-500" />
      ) : variant === "warning" ? (
        <WarningIcon className="h-5 w-5 shrink-0 text-amber-600" />
      ) : (
        <ErrorIcon className="h-5 w-5 shrink-0 text-red-500" />
      )}
      <p
        className={`toast-text font-bold leading-snug ${
          variant === "success"
            ? "bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent dark:from-orange-400 dark:to-orange-300"
            : variant === "warning"
              ? "text-amber-900 dark:text-amber-200"
              : "text-red-700 dark:text-red-300"
        }`}
      >
        {message}
      </p>
    </div>
  );
}

function SuccessIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
