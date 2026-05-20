import { Info } from "lucide-react";

import DelegateStatementContainer from "./DelegateStatementContainer";
import TopStakeholders from "./TopStakeholders";
import TopIssues from "./TopIssues";
import { Delegate } from "@/lib/types/delegate";
import { DelegateStatement } from "@/lib/types/delegateStatement";

interface Props {
  delegate: Delegate;
  showNoVotingPowerBanner?: boolean;
}

function ZeroVotingPowerNotice() {
  return (
    <div
      role="alert"
      className="mb-4 flex gap-3 rounded-lg border border-line bg-wash p-4 shadow-newDefault"
    >
      <Info
        aria-hidden
        className="mt-0.5 h-5 w-5 shrink-0 stroke-[2px] text-negative"
      />
      <div className="min-w-0 flex-1 flex flex-col gap-2 text-primary">
        <p className="text-base font-semibold leading-snug">
          This profile has no voting power
        </p>
        <p className="text-sm text-secondary leading-relaxed">
          Our records show that this delegate currently holds no voting weight
          on this protocol. Any statements or votes posted from this profile do
          not influence proposal outcomes. Profiles like this are sometimes used
          for signaling or scams; please review with appropriate context.
        </p>
      </div>
    </div>
  );
}

const DelegateStatementWrapper = ({
  delegate,
  showNoVotingPowerBanner = false,
}: Props) => {
  return (
    <>
      {showNoVotingPowerBanner && <ZeroVotingPowerNotice />}
      <DelegateStatementContainer delegate={delegate} />
      {delegate.statement && (
        <>
          <TopIssues
            statement={delegate.statement as unknown as DelegateStatement}
          />
          <TopStakeholders
            statement={delegate.statement as unknown as DelegateStatement}
          />
        </>
      )}
    </>
  );
};

export const DelegateStatementSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse p-12 rounded-lg bg-tertiary/10">
      <div className="h-4 w-1/2 bg-tertiary/20 rounded-md"></div>
      <div className="h-4 w-1/3 bg-tertiary/20 rounded-md"></div>
    </div>
  );
};

export default DelegateStatementWrapper;
