import type { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";

/**
 * Creates the standardized message format for delegate statement signing
 * This ensures frontend and backend use identical message structure
 */
export function createDelegateStatementMessage(
  formValues: DelegateStatementFormValues,
  additionalData: {
    daoSlug: string;
    discord: string;
    email: string;
    twitter: string;
    warpcast: string;
    topIssues: Array<{ type: string; value: string }>;
    topStakeholders: Array<{ type: string; value: string }>;
    scwAddress?: string;
  }
): string {
  const messageBody = {
    agreeCodeConduct: formValues.agreeCodeConduct,
    agreeDaoPrinciples: formValues.agreeDaoPrinciples,
    daoSlug: additionalData.daoSlug,
    discord: additionalData.discord,
    delegateStatement: formValues.delegateStatement,
    email: additionalData.email,
    twitter: additionalData.twitter,
    warpcast: additionalData.warpcast,
    topIssues: additionalData.topIssues,
    topStakeholders: additionalData.topStakeholders,
    scwAddress: additionalData.scwAddress,
  };

  // Use consistent formatting with tab indentation
  return JSON.stringify(messageBody, undefined, "\t");
}
