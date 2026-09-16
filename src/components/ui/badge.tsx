interface BadgeProps {
  variant?: "success" | "danger" | "default";
  children: React.ReactNode;
}

export default function Badge({
  variant = "default",
  children,
}: BadgeProps) {
  const variants = {
    success: "bg-success-bg text-primary border-success",
    danger: "bg-danger-bg text-danger border-danger",
    default: "bg-surface-hover text-text-muted border-border",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-[var(--radius-sm)] border ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
