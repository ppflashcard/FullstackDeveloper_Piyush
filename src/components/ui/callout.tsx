import { cn } from "@/lib/utils";

type CalloutVariant = "info" | "success" | "warning" | "tip";

type CalloutProps = {
  title?: string;
  variant?: CalloutVariant;
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<CalloutVariant, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100",
  tip: "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-100",
};

export function Callout({
  title,
  variant = "info",
  children,
  className,
}: CalloutProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm leading-relaxed",
        variantStyles[variant],
        className,
      )}
    >
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div className="text-stone-700 dark:text-stone-300">{children}</div>
    </div>
  );
}
