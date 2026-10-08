import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export interface AlertProps {
  variant?: "error" | "warning" | "info";
  title?: string;
  children?: ReactNode;
  /** Controls on the right, e.g. a button that fixes the problem. */
  action?: ReactNode;
  className?: string;
}

const variantClasses: Record<NonNullable<AlertProps["variant"]>, string> = {
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  info: "bg-sky-50 border-sky-200 text-sky-900",
};

const icons: Record<NonNullable<AlertProps["variant"]>, ReactNode> = {
  error: <AlertCircle className="size-5 shrink-0" />,
  warning: <AlertTriangle className="size-5 shrink-0" />,
  info: <Info className="size-5 shrink-0" />,
};

export function Alert({
  variant = "error",
  title,
  children,
  action,
  className = "",
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 border rounded-lg px-4 py-3 text-sm ${variantClasses[variant]} ${className}`}
    >
      {icons[variant]}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : ""}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
