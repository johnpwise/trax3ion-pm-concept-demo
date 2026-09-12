import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type Breadcrumb = {
  label: string;
  to?: string;
};

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  children?: ReactNode;
};

export default function PageHeader({ title, description, breadcrumbs, actions, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav className="mb-2 flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? <ChevronRight className="h-3.5 w-3.5" /> : null}
              {crumb.to ? (
                <Link to={crumb.to} className="transition-colors hover:text-surface-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-surface-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface-foreground">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
