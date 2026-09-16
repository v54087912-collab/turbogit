import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-[var(--radius-md)] p-6 transition-all duration-200 ${
        hover
          ? "hover:shadow-[0_0_24px_rgba(141,214,255,0.15)] hover:border-text-accent"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
