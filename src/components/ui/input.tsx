import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-orange-500 dark:focus:ring-orange-900/50",
        className,
      )}
      {...props}
    />
  );
}
