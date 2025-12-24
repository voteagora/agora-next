"use client";

import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon } from "lucide-react";
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  SortBy,
  Stats,
  Pagination,
  Configure,
  Highlight,
} from "react-instantsearch";
import type { Hit, SearchClient } from "instantsearch.js";
import {
  createForumSearchConfig,
  createSortOptions,
  unifiedSearchConfiguration,
} from "@/lib/instantSearch";
import { cn } from "@/lib/utils";

interface ForumCategory {
  id: number;
  name: string;
  isDuna: boolean;
  topicsCount?: number;
}

interface InstantSearchProps {
  daoSlug: string;
  categories?: ForumCategory[];
  className?: string;
}

interface ForumHit extends Hit {
  contentType: "topic" | "post" | "category";
  title: string;
  content: string;
  author: string;
  createdAt: number;
  isNsfw: boolean;
  isDeleted: boolean;

  // Topic-specific fields
  categoryName?: string;
  postsCount?: number;

  // Post-specific fields
  topicTitle?: string;
  parentPostId?: number;

  // Category-specific fields
  description?: string;
  isDuna?: boolean;
  topicsCount?: number;
}

const ForumInstantSearch: React.FC<InstantSearchProps> = ({
  daoSlug,
  className,
}) => {
  const UnifiedHitComponent = ({ hit }: { hit: ForumHit }) => {
    const contentTypeColors = {
      topic: "bg-blue-100 text-blue-800",
      post: "bg-green-100 text-green-800",
      category: "bg-purple-100 text-purple-800",
    };

    const getContentTypeLabel = (type: string) => {
      switch (type) {
        case "topic":
          return "Topic";
        case "post":
          return "Post";
        case "category":
          return "Category";
        default:
          return type;
      }
    };

    return (
      <div className="border rounded-lg p-4 space-y-2 bg-cardBackground">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">
            <Highlight hit={hit} attribute="title" />
          </h3>
          <div className="flex gap-2 text-sm text-secondary">
            <span
              className={`px-2 py-1 rounded text-xs ${contentTypeColors[hit.contentType]}`}
            >
              {getContentTypeLabel(hit.contentType)}
            </span>
            {hit.author && <span>{hit.author}</span>}
            {hit.categoryName && hit.contentType === "topic" && (
              <span className="bg-wash px-2 py-1 rounded">
                {hit.categoryName}
              </span>
            )}
            {hit.topicTitle && hit.contentType === "post" && (
              <span className="bg-wash px-2 py-1 rounded text-xs">
                in: {hit.topicTitle}
              </span>
            )}
            {hit.isDuna && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                DUNA
              </span>
            )}
            <span>{new Date(hit.createdAt * 1000).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-secondary">
          <Highlight hit={hit} attribute="content" />
          {hit.description && hit.contentType === "category" && (
            <div className="mt-2">
              <Highlight hit={hit} attribute="description" />
            </div>
          )}
        </div>
        <div className="flex gap-4 text-sm text-tertiary">
          {hit.contentType === "topic" && (
            <>
              <span>{hit.postsCount || 0} posts</span>
            </>
          )}
          {hit.contentType === "post" && <></>}
          {hit.contentType === "category" && (
            <span>{hit.topicsCount || 0} topics</span>
          )}
        </div>
      </div>
    );
  };

  const getSearchConfig = () => {
    const config = createForumSearchConfig(daoSlug);
    return {
      ...config,
      searchClient: config.searchClient as unknown as SearchClient,
    };
  };

  const getSortOptions = () => createSortOptions(daoSlug);

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="w-5 h-5" />
            Search Forum - {daoSlug}
          </CardTitle>
        </CardHeader>
      </Card>

      <InstantSearch {...getSearchConfig()}>
        <Configure
          {...({
            facetFilters: [`daoSlug:${daoSlug}`].flat(),
            ...unifiedSearchConfiguration,
          } as any)}
        />

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_250px]">
            <div className="space-y-4">
              <SearchBox placeholder="Search" />
              <Stats className="text-sm text-secondary" />
              <Hits hitComponent={UnifiedHitComponent} />
              <Pagination />
            </div>
            <div className="space-y-4">
              <SortBy items={getSortOptions()} />
              <RefinementList attribute="contentType" limit={3} />
              <RefinementList attribute="categoryName" limit={10} />
              <RefinementList
                attribute="author"
                limit={10}
                searchable
                searchablePlaceholder="Search authors..."
              />
            </div>
          </div>
        </div>
      </InstantSearch>
    </div>
  );
};

export default ForumInstantSearch;
