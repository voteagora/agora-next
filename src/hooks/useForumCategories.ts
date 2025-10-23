import { useQuery } from "@tanstack/react-query";
import { getForumCategories } from "@/lib/actions/forum";
import type { ForumCategory } from "@/lib/forumUtils";

export const useForumCategories = () => {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ["forum-categories"],
    queryFn: async () => {
      const result = await getForumCategories();

      if (!result.success) {
        throw new Error(
          "error" in result ? result.error : "Failed to fetch categories"
        );
      }

      if (!("data" in result)) {
        throw new Error("No data received");
      }

      return result.data.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        archived: cat.archived,
        adminOnlyTopics: cat.adminOnlyTopics,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(),
        isDuna: cat.isDuna,
        topicsCount: cat.topicsCount,
      })) as ForumCategory[];
    },
  });

  return {
    categories,
    isLoading,
    error,
  };
};
