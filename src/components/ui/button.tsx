import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-brand text-text-on-brand hover:bg-brand-hover border-transparent",
  secondary:
    "bg-surface-elevated text-text-primary border-border hover:border-border-strong hover:bg-brand-light",
  ghost: "bg-transparent text-text-secondary hover:bg-brand-light hover:text-text-primary border-transparent",
  danger:
    "bg-error/10 text-error hover:bg-error/20 border-transparent",
} as const;

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
