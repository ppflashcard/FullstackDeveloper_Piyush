import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        variant === "primary" &&
          "bg-orange-500 text-white shadow-sm hover:bg-orange-600",
        variant === "secondary" &&
          "border border-stone-200 bg-white text-stone-900 hover:border-orange-300 hover:bg-orange-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-orange-950/30",
        variant === "ghost" &&
          "text-stone-500 hover:bg-orange-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-orange-950/30 dark:hover:text-stone-100",
        variant === "danger" &&
          "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400",
        className,
      )}
      {...props}
    />
  );
}
