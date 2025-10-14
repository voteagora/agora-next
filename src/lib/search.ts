import { MeiliSearch, Index, MeiliSearchApiError } from "meilisearch";

let cachedClient: MeiliSearch | null = null;

const getClient = () => {
  if (cachedClient) return cachedClient;

  const host = process.env.NEXT_PUBLIC_MEILISEARCH_HOST;
  const apiKey = process.env.MEILISEARCH_API_KEY;

  if (!host) {
    throw new Error(
      "Missing NEXT_PUBLIC_MEILISEARCH_HOST environment variable"
    );
  }

  if (!apiKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_MEILISEARCH_API_KEY environment variable"
    );
  }

  cachedClient = new MeiliSearch({ host, apiKey });
  return cachedClient;
};

export const getForumIndexName = (daoSlug: string) => `forum_${daoSlug}`;

export interface ForumDocument {
  id: string; // Combination of dao_slug + type + item_id
  contentType: "topic" | "post" | "category";
  daoSlug: string;

  // Common fields
  title: string;
  content: string;
  author: string;
  createdAt: number;

  // Type-specific fields
  // Topic fields
  topicId?: number;
  categoryId?: number;
  categoryName?: string;
  postsCount?: number;
  isDeleted?: boolean;
  isNsfw?: boolean;

  // Post fields
  postId?: number;
  topicTitle?: string;
  parentPostId?: number;

  // Category fields
  description?: string;
  isDuna?: boolean;
  adminOnlyTopics?: boolean;
  topicsCount?: number;
}

export interface SearchResult<T> {
  hits: T[];
  query: string;
  processingTimeMs: number;
  hitsPerPage: number;
  page: number;
  totalPages: number;
  totalHits: number;
}

export class ForumSearchService {
  private getIndex(daoSlug: string): Index {
    const client = getClient();
    return client.index(getForumIndexName(daoSlug));
  }

  async initializeIndex(daoSlug: string): Promise<void> {
    try {
      const client = getClient();
      const indexName = getForumIndexName(daoSlug);

      try {
        const { taskUid } = await client.createIndex(indexName, {
          primaryKey: "id",
        });
      } catch (error) {
        if (
          error instanceof MeiliSearchApiError &&
          error.cause?.code === "index_already_exists"
        ) {
          // Index already exists, nothing to do here.
        } else {
          throw error;
        }
      }

      const index = this.getIndex(daoSlug);

      const settingsTask = await index.updateSettings({
        searchableAttributes: [
          "title",
          "content",
          "author",
          "categoryName",
          "topicTitle",
          "description"
        ],
        filterableAttributes: [
          "daoSlug",
          "contentType",
          "categoryId",
          "topicId",
          "author",
          "createdAt",
          "isDuna",
          "adminOnlyTopics",
        ],
        sortableAttributes: ["createdAt", "postsCount", "topicsCount"],
        rankingRules: [
          "words",
          "typo",
          "proximity",
          "attribute",
          "sort",
          "exactness",
        ],
      });
    } catch (error) {
      console.error(`Error initializing search index for ${daoSlug}:`, error);
      throw error;
    }
  }

  async indexDocument(document: ForumDocument): Promise<void> {
    try {
      const index = this.getIndex(document.daoSlug);
      const task = await index.addDocuments([document]);
    } catch (error) {
      console.error(`Error indexing ${document.contentType}:`, error);
      throw error;
    }
  }

  async replaceDocuments(
    daoSlug: string,
    documents: ForumDocument[]
  ): Promise<void> {
    try {
      const index = this.getIndex(daoSlug);
      const deleteTask = await index.deleteAllDocuments();

      if (!documents.length) {
        return;
      }

      const addTask = await index.addDocuments(documents);
    } catch (error) {
      console.error(`Error replacing documents for ${daoSlug}:`, error);
      throw error;
    }
  }

  async deleteDocument({
    id,
    daoSlug,
  }: {
    id: string;
    daoSlug: string;
  }): Promise<void> {
    try {
      const index = this.getIndex(daoSlug);
      const task = await index.deleteDocument(id);
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }
}

export const forumSearchService = new ForumSearchService();
