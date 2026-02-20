import { useQuery } from "@tanstack/react-query";
import { getAlchemyId } from "@/lib/alchemyConfig";
import { BLOCKCACHEURL } from "@/lib/constants";

interface UseBlockCacheWrappedEnsProps {
  address: `0x${string}`;
  chainId?: number | string;
  enabled?: boolean;
}

interface EnsData {
  name: string | null;
  avatar: string | null;
}

const useBlockCacheWrappedEns = ({
  address,
  chainId = 1,
  enabled = true,
}: UseBlockCacheWrappedEnsProps) => {
  const { data } = useQuery<EnsData>({
    queryKey: ["blockCacheEns", chainId, address],
    queryFn: async () => {
      const headers: HeadersInit = {};

      // Add Alchemy API key header if available
      try {
        const alchemyId = getAlchemyId();
        headers["alchemy-api-key"] = alchemyId;
      } catch (error) {
        // Key not available, continue without it
      }

      const response = await fetch(
        `${BLOCKCACHEURL}/ens_avatar/${chainId}/${address}`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ENS data: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle different response formats
      if (typeof data === "string") {
        return { name: data || null, avatar: null };
      }

      // If it's an object, extract both name and avatar fields
      return {
        name: data?.name || data?.ensName || null,
        avatar: data?.avatar || null,
      };
    },
    enabled: !!address && enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1,
  });

  return { data };
};

export default useBlockCacheWrappedEns;
