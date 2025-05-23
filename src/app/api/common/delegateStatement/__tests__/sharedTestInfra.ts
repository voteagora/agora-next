import { DelegateStatement } from "@/app/api/common/delegateStatement/delegateStatement";

// This is a shared test infrastructure for the delegate statement API.
// It is used by both the delegate statement API and the delegate statement
// form.

import Tenant from "@/lib/tenant/tenant";
const { slug, ui } = Tenant.current();

const requireCodeOfConduct = !!ui.toggle("delegates/code-of-conduct")?.enabled;
const requireDaoPrinciples = !!ui.toggle("delegates/dao-principles")?.enabled;
const topIssues = ui.governanceIssues;
const defaultIssues = !topIssues;

// This (setDefaultValues) could live outside createDelegateStatement,
// but it's only used there, so it's here.'
export const setDefaultValues = (
  delegateStatement: DelegateStatement | null
) => {
  return {
    agreeCodeConduct: !requireCodeOfConduct,
    agreeDaoPrinciples: !requireDaoPrinciples,
    daoSlug: slug,
    discord: delegateStatement?.discord || "",
    delegateStatement:
      (delegateStatement?.payload as { delegateStatement?: string })
        ?.delegateStatement || "",
    email: delegateStatement?.email || "",
    twitter: delegateStatement?.twitter || "",
    warpcast: delegateStatement?.warpcast || "",
    scwAddress: delegateStatement?.scw_address || "",
    topIssues: Array.isArray(
      (
        delegateStatement?.payload as {
          topIssues: { value: string; type: string }[];
        }
      )?.topIssues
    )
      ? (
          delegateStatement?.payload as {
            topIssues: { value: string; type: string }[];
          }
        )?.topIssues
      : defaultIssues
        ? [] // Convert boolean `defaultIssues` to an empty array
        : [],

    topStakeholders:
      (
        delegateStatement?.payload as {
          topStakeholders: {
            value: string;
            type: string;
          }[];
        }
      )?.topStakeholders?.length > 0
        ? (
            delegateStatement?.payload as {
              topStakeholders: {
                value: string;
                type: string;
              }[];
            }
          )?.topStakeholders
        : [],

    openToSponsoringProposals:
      (
        delegateStatement?.payload as {
          openToSponsoringProposals?: "yes" | "no" | null;
        }
      )?.openToSponsoringProposals || null,
    mostValuableProposals: Array.isArray(
      (
        delegateStatement?.payload as {
          mostValuableProposals?: { number: string }[];
        }
      )?.mostValuableProposals
    )
      ? (
          (
            delegateStatement?.payload as {
              mostValuableProposals?: object[];
            }
          )?.mostValuableProposals as { number: string }[]
        ).filter(
          (proposal) =>
            typeof proposal === "object" &&
            "number" in proposal &&
            typeof proposal.number === "string"
        )
      : [],
    leastValuableProposals: Array.isArray(
      (
        delegateStatement?.payload as {
          leastValuableProposals?: { number: string }[];
        }
      )?.leastValuableProposals
    )
      ? (
          (
            delegateStatement?.payload as {
              leastValuableProposals?: object[];
            }
          )?.leastValuableProposals as { number: string }[]
        ).filter(
          (proposal) =>
            typeof proposal === "object" &&
            "number" in proposal &&
            typeof proposal.number === "string"
        )
      : [],
    notificationPreferences: (delegateStatement?.notification_preferences as {
      wants_proposal_created_email: "prompt" | "prompted" | boolean;
      wants_proposal_ending_soon_email: "prompt" | "prompted" | boolean;
    }) || {
      wants_proposal_created_email: "prompt",
      wants_proposal_ending_soon_email: "prompt",
    },
    last_updated: new Date().toISOString(),
  };
};
