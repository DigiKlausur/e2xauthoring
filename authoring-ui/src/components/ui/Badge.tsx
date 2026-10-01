import type { ReactNode } from "react";

export interface BadgeProps {
  tone?: "success" | "warning" | "neutral" | "info";
  children: ReactNode;
}

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-800",
  neutral: "bg-gray-100 text-gray-600",
  info: "bg-primary-subtle text-primary",
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
