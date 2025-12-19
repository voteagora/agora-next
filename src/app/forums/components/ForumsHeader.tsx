import React, { Fragment } from "react";
import ForumsSearch from "./ForumsSearch";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ForumsBreadcrumbItem {
  label: string;
  href?: string;
}

interface ForumsHeaderProps {
  breadcrumbs?: ForumsBreadcrumbItem[];
  description?: string | null;
  showBreadcrumb?: boolean;
  fallbackTitle?: string;
}

export default function ForumsHeader({
  breadcrumbs = [],
  description,
  showBreadcrumb = breadcrumbs.length > 0,
  fallbackTitle = "Discussions",
}: ForumsHeaderProps) {
  const shouldRenderBreadcrumb = showBreadcrumb && breadcrumbs.length > 0;

  return (
    <div className="mt-6 max-w-7xl mx-auto px-6 sm:px-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          {shouldRenderBreadcrumb ? (
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <Fragment key={`${breadcrumb.label}-${index}`}>
                      <BreadcrumbItem>
                        {breadcrumb.href && !isLast ? (
                          <BreadcrumbLink href={breadcrumb.href}>
                            {breadcrumb.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            <h3 className="text-primary font-bold">{fallbackTitle}</h3>
          )}

          {description ? <h3 className="text-primary">{description}</h3> : null}
        </div>
        <div className="flex gap-2">
          <ForumsSearch />
        </div>
      </div>
    </div>
  );
}
