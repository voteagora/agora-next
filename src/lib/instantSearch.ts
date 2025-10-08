import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { getForumIndexName } from "./search";

const MEILISEARCH_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST;
const MEILISEARCH_API_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_CLIENT_API_KEY;

let searchClient: any;
let setMeiliSearchParams: any = () => {};

if (MEILISEARCH_HOST && MEILISEARCH_API_KEY) {
  const res = instantMeiliSearch(MEILISEARCH_HOST, MEILISEARCH_API_KEY, {
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
      attributesToSearchOn: ["content"],
    },
  });
  searchClient = res.searchClient;
  setMeiliSearchParams = res.setMeiliSearchParams;
} else {
  // No-op client to avoid build-time failure when MeiliSearch is not configured
  searchClient = {
    search: async () => ({ results: [] }),
  } as any;
  setMeiliSearchParams = () => {};
}

export { searchClient, setMeiliSearchParams };

export const createForumSearchConfig = (daoSlug: string) => {
  const candidate = getForumIndexName(daoSlug);

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
  const indexName = getForumIndexName(daoSlug);
  return [
    { label: "Most Recent", value: indexName },
    {
      label: "Most Active",
      value: `${indexName}:postsCount:desc`,
    },
  ];
};
