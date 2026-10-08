import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  /** Accessible name; also shown as the tooltip. */
  label: string;
  icon: ReactNode;
  variant?: "default" | "danger";
}

const variantClasses: Record<
  NonNullable<IconButtonProps["variant"]>,
  string
> = {
  default: "text-gray-500 hover:text-primary hover:bg-primary-subtle",
  danger: "text-gray-500 hover:text-danger hover:bg-red-50",
};

export function IconButton({
  label,
  icon,
  variant = "default",
  type = "button",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-lg p-1.5 transition-colors disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
