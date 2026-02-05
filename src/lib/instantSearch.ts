import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { getForumIndexName } from "./search";
import Tenant from "./tenant/tenant";

const { isProd } = Tenant.current();

const MEILISEARCH_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST;
const MEILISEARCH_API_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_CLIENT_API_KEY;

if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) {
  throw new Error("Missing Meilisearch host or API key environment variables");
}

const { searchClient, setMeiliSearchParams } = instantMeiliSearch(
  MEILISEARCH_HOST,
  MEILISEARCH_API_KEY,
  {
    primaryKey: "id",
    placeholderSearch: false,
    meiliSearchParams: {
      attributesToRetrieve: [
        "objectID",
        "topicId",
        "title",
        "content",
        "categoryName",
        "createdAt",
        "contentType",
        "topicTitle",
      ],
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>",
    },
  }
);

export { searchClient, setMeiliSearchParams };

export const createForumSearchConfig = (daoSlug: string) => {
  const candidate = getForumIndexName(daoSlug, isProd);

  return {
    indexName: candidate,
    searchClient,
  };
};

export const unifiedSearchConfiguration = {
  hitsPerPage: 20,
  attributesToHighlight: ["title", "content", "description"],
  highlightPreTag: "<mark>",
  highlightPostTag: "</mark>",
};

export const createSortOptions = (daoSlug: string) => {
  const indexName = getForumIndexName(daoSlug, isProd);
  return [
    { label: "Most Recent", value: indexName },
    {
      label: "Most Active",
      value: `${indexName}:postsCount:desc`,
    },
  ];
};
