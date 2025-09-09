import { MeiliSearch, Index } from "meilisearch";

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST as string,
  apiKey: process.env.MEILISEARCH_API_KEY as string,
});

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
    return client.index(getForumIndexName(daoSlug));
  }

  async initializeIndex(daoSlug: string): Promise<void> {
    try {
      const indexName = getForumIndexName(daoSlug);

      // Create index if it doesn't exist
      await client.createIndex(indexName, { primaryKey: "id" });

      const index = this.getIndex(daoSlug);

      await index.updateSettings({
        searchableAttributes: [
          "title",
          "content",
          "author",
          "categoryName",
          "topicTitle",
          "description",
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
      await index.addDocuments([document]);
    } catch (error) {
      console.error(`Error indexing ${document.contentType}:`, error);
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
      await index.deleteDocument(id);
    } catch (error) {
      console.error(`Error deleting ${document.contentType}:`, error);
      throw error;
    }
  }
}

export const forumSearchService = new ForumSearchService();
