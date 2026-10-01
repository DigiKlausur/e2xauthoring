import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

export interface Breadcrumb {
  label: string;
  to?: string;
}

interface Props {
  breadcrumbs?: Breadcrumb[];
  title: string;
  subtitle?: ReactNode;
  /** Page-level actions on the right, e.g. the button that creates an item. */
  actions?: ReactNode;
}

export function PageHeader({ breadcrumbs, title, subtitle, actions }: Props) {
  return (
    <header className="bg-white border-b border-gray-200 px-10 py-8 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="text-sm text-gray-400 mb-1">
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={`${index}-${crumb.label}`}>
                {index > 0 && " / "}
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="hover:text-primary hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-700 font-medium">
                    {crumb.label}
                  </span>
                )}
              </Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-3xl font-bold text-gray-900 m-0 break-words">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-gray-500 max-w-3xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </header>
  );
}
