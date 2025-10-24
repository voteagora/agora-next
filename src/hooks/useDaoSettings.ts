import { useQuery } from "@tanstack/react-query";

export interface DaoSettings {
  votingPeriod: number;
  votingDelay: number;
  [key: string]: any;
}

export function useDaoSettings(daoId?: string) {
  return useQuery<DaoSettings>({
    queryKey: ["daoSettings", daoId],
    queryFn: async () => {
      if (!daoId) {
        return {
          votingPeriod: 7 * 24 * 60 * 60,
          votingDelay: 0,
        };
      }

      const response = await fetch(`/api/dao/settings?daoId=${daoId}`);

      if (!response.ok) {
        return {
          votingPeriod: 7 * 24 * 60 * 60,
          votingDelay: 0,
        };
      }

      return response.json();
    },
    enabled: !!daoId,
  });
}
