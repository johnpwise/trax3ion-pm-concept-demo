import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { useMediaQuery } from "../lib/useMediaQuery";

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
  const isDesktopViewport = useMediaQuery("(min-width: 768px)");

  const backCrumb = breadcrumbs
    ?.slice(0, -1)
    .reverse()
    .find((crumb) => crumb.to);

  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        isDesktopViewport ? (
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
        ) : backCrumb ? (
          <Link
            to={backCrumb.to!}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-surface-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to {backCrumb.label}
          </Link>
        ) : null
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
