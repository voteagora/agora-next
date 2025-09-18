import { getDunaCategoryId } from "@/lib/actions/forum";
import { useQuery } from "@tanstack/react-query";

const DUNA_CATEGORY_STORAGE_KEY = "duna-category-id";

const getDunaCategoryFromStorage = (): number | null => {
  if (typeof window === "undefined") return null;

  try {
    const storageKey = `${DUNA_CATEGORY_STORAGE_KEY}`;
    const stored = localStorage.getItem(storageKey);
    return stored ? parseInt(stored, 10) : null;
  } catch {
    return null;
  }
};

const setDunaCategoryToStorage = (categoryId: number | null): void => {
  if (typeof window === "undefined" || categoryId === null) return;

  try {
    const storageKey = `${DUNA_CATEGORY_STORAGE_KEY}`;
    localStorage.setItem(storageKey, categoryId.toString());
  } catch {
    // Silently fail if localStorage is not available
  }
};

export const useDunaCategory = () => {
  const { data: dunaCategoryId, isLoading } = useQuery({
    queryKey: ["duna-category-id"],
    queryFn: async () => {
      // Try to get from localStorage first
      const cached = getDunaCategoryFromStorage();
      if (cached !== null) {
        // Verify the cached value in the background
        getDunaCategoryId().then((serverValue) => {
          if (serverValue !== cached) {
            setDunaCategoryToStorage(serverValue);
          }
        });
        return cached;
      }

      // Fetch from server if not cached
      const serverValue = await getDunaCategoryId();
      setDunaCategoryToStorage(serverValue);
      return serverValue;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  return {
    dunaCategoryId,
    isLoading,
  };
};

export default useDunaCategory;
