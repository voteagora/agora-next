import { useQuery } from "@tanstack/react-query";
import { getForumCategoryAttachments } from "@/lib/actions/forum/attachments";
import { useDunaCategory } from "@/hooks/useDunaCategory";
import Tenant from "@/lib/tenant/tenant";

interface FinancialStatement {
  id: number;
  name: string;
  url: string;
  ipfsCid: string;
  createdAt: string;
  uploadedBy: string;
  archived?: boolean;
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

      const documentsResult = await getForumCategoryAttachments({
        categoryId: dunaCategoryId,
      });

      if (!documentsResult.success || !documentsResult.data) {
        return null;
      }

      const financialStatements = documentsResult.data.filter(
        (doc) => doc.isFinancialStatement ?? false
      );

      if (financialStatements.length === 0) {
        return null;
      }

      const now = new Date();
      const sortedStatements = [...financialStatements].sort((a, b) => {
        const dateA = new Date(a.revealTime ?? a.createdAt);
        const dateB = new Date(b.revealTime ?? b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      const mostRecentStatement = sortedStatements[0];
      const revealTime = mostRecentStatement.revealTime
        ? new Date(mostRecentStatement.revealTime).getTime()
        : null;

      const isRecentlyReleased =
        revealTime !== null &&
        revealTime > now.getTime() - 7 * 24 * 60 * 60 * 1000;

      return isRecentlyReleased
        ? (mostRecentStatement as FinancialStatement)
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
