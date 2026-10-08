import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  /** `toolbar` for buttons in table toolbars, `pagination` for page controls. */
  size?: "default" | "toolbar" | "pagination";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-primary-foreground border border-primary hover:bg-primary-hover hover:border-primary-hover",
  secondary:
    "bg-white text-primary border border-primary hover:bg-primary-subtle",
  danger: "bg-danger text-white border border-danger hover:bg-danger-hover",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "px-4 py-2.5 text-sm",
  toolbar: "px-3 py-2 text-xs",
  pagination: "px-3 py-1.5 text-xs",
};

export function Button({
  variant = "primary",
  size = "default",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
