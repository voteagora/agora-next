import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { getForumIndexName } from "./search";

const MEILISEARCH_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST;
const MEILISEARCH_API_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY;

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
      attributesToSearchOn: ["content"],
    },
  }
);

export { searchClient, setMeiliSearchParams };

export const createForumSearchConfig = (daoSlug: string) => {
  const candidate = getForumIndexName(daoSlug);

  return {
    indexName: candidate,
    searchClient,
  };
};
