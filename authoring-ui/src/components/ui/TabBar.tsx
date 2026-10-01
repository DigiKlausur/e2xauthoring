import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

export interface TabBarTab {
  to: string;
  label: string;
  icon?: ReactNode;
  show?: boolean;
}

export interface TabBarProps {
  tabs: TabBarTab[];
  className?: string;
}

export function TabBar({ tabs, className = "" }: TabBarProps) {
  return (
    <nav className={`flex gap-6 ${className}`}>
      {tabs
        .filter((tab) => tab.show ?? true)
        .map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex items-center gap-2 py-3 text-sm border-b-[3px] transition-colors ${
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`
            }
          >
            {tab.icon}
            {tab.label}
          </NavLink>
        ))}
    </nav>
  );
}
