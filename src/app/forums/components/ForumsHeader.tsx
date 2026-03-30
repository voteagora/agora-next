import React, { Fragment } from "react";
import ForumsSearch from "./ForumsSearch";
import NewTopicButton from "./NewTopicButton";
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

interface TopicContext {
  id: number;
  title: string;
  content: string;
  createdAt?: string;
  commentsCount?: number;
  isTempCheck?: boolean;
  tempCheckPassed?: boolean;
}

interface ForumsHeaderProps {
  breadcrumbs?: ForumsBreadcrumbItem[];
  description?: string | null;
  showBreadcrumb?: boolean;
  fallbackTitle?: string;
  isDuna?: boolean;
  topicContext?: TopicContext;
}

export default function ForumsHeader({
  breadcrumbs = [],
  description,
  showBreadcrumb = breadcrumbs.length > 0,
  fallbackTitle = "Discussions",
  isDuna = false,
  topicContext,
}: ForumsHeaderProps) {
  const shouldRenderBreadcrumb = showBreadcrumb && breadcrumbs.length > 0;

  return (
    <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div className="min-w-0 flex-1">
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
        <div className="flex flex-col gap-3 w-full shrink-0 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
          <ForumsSearch className="w-full min-w-0 sm:max-w-[400px] lg:w-[400px]" />
          <div className="shrink-0 sm:flex sm:items-center">
            <NewTopicButton isDuna={isDuna} topicContext={topicContext} />
          </div>
        </div>
      </div>
    </div>
  );
}
