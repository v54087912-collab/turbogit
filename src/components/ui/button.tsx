import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-text-accent focus-visible:outline-offset-2";

    const variants = {
      primary:
        "bg-primary text-black hover:bg-primary-hover border-none",
      ghost:
        "bg-transparent text-text-primary border border-border hover:bg-surface-hover",
      danger:
        "bg-danger-bg text-danger border border-transparent hover:border-danger",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-[var(--radius-sm)]",
      md: "h-10 px-4 text-sm rounded-[var(--radius-sm)]",
      lg: "h-12 px-6 text-base rounded-[var(--radius-md)]",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export default Button;
