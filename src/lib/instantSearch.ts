import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST as string;

const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY as string;

export const searchClient = instantMeiliSearch(
  MEILISEARCH_HOST,
  MEILISEARCH_API_KEY,
  {
    primaryKey: "id",
    placeholderSearch: false,
  }
);

import { getForumIndexName } from "./search";

export const createForumSearchConfig = (daoSlug: string) => ({
  indexName: getForumIndexName(daoSlug),
  searchClient,
});

export const createSortOptions = (daoSlug: string) => {
  const indexName = getForumIndexName(daoSlug);
  return [
    { label: "Most Recent", value: indexName },
    {
      label: "Most Active",
      value: `${indexName}:postsCount:desc`,
    },
  ];
};

export const unifiedSearchConfiguration = {
  hitsPerPage: 20,
  attributesToHighlight: ["title", "content", "description"],
  highlightPreTag: "<mark>",
  highlightPostTag: "</mark>",
};
