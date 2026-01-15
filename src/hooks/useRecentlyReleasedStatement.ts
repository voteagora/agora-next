import { useQuery } from "@tanstack/react-query";
import { getForumTopics } from "@/lib/actions/forum";
import { useDunaCategory } from "@/hooks/useDunaCategory";
import Tenant from "@/lib/tenant/tenant";

interface FinancialStatement {
  id: number;
  title: string;
  createdAt: string;
  revealTime?: string | null;
  expirationTime?: string | null;
}

export function useRecentlyReleasedStatement() {
  const { ui } = Tenant.current();
  const financialStatementsToggle = ui.toggle("duna/financial-statements");
  const isFinancialStatementsEnabled =
    financialStatementsToggle?.enabled ?? false;
  const { dunaCategoryId, isLoading: isLoadingCategory } = useDunaCategory();

  const { data: recentlyReleasedStatement, isLoading } = useQuery({
    queryKey: ["recently-released-statement", dunaCategoryId],
    queryFn: async (): Promise<FinancialStatement | null> => {
      if (!dunaCategoryId) return null;

      const topicsResult = await getForumTopics({
        categoryId: dunaCategoryId,
      });

      if (!topicsResult.success || !topicsResult.data) {
        return null;
      }

      const financialStatements = topicsResult.data.filter(
        (topic: any) => topic.isFinancialStatement ?? false
      );

      if (financialStatements.length === 0) {
        return null;
      }

      const now = new Date();
      const sortedStatements = [...financialStatements].sort(
        (a: any, b: any) => {
          const dateA = new Date(a.revealTime ?? a.createdAt);
          const dateB = new Date(b.revealTime ?? b.createdAt);
          return dateB.getTime() - dateA.getTime();
        }
      );

      const mostRecentStatement = sortedStatements[0];
      const revealTime = mostRecentStatement.revealTime
        ? new Date(mostRecentStatement.revealTime).getTime()
        : null;

      const isRecentlyReleased =
        revealTime !== null &&
        revealTime > now.getTime() - 7 * 24 * 60 * 60 * 1000;

      return isRecentlyReleased
        ? {
            id: mostRecentStatement.id,
            title: mostRecentStatement.title,
            createdAt: mostRecentStatement.createdAt,
            revealTime: mostRecentStatement.revealTime,
            expirationTime: mostRecentStatement.expirationTime,
          }
        : null;
    },
    enabled:
      isFinancialStatementsEnabled && !!dunaCategoryId && !isLoadingCategory,
    staleTime: 5 * 60 * 1000,
  });

  return {
    recentlyReleasedStatement: recentlyReleasedStatement ?? null,
    isLoading: isLoading || isLoadingCategory,
  };
}
