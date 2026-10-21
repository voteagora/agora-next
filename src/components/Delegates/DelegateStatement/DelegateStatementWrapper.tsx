import { Info } from "lucide-react";

import DelegateStatementContainer from "./DelegateStatementContainer";
import TopStakeholders from "./TopStakeholders";
import TopIssues from "./TopIssues";
import { Delegate } from "@/app/api/common/delegates/delegate";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  delegate: Delegate;
  showNoVotingPowerBanner?: boolean;
}

function ZeroVotingPowerNotice() {
  const { ui } = Tenant.current();
  const copy = ui.copy;

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
          {copy.delegates.profile.noVotingPowerTitle}
        </p>
        <p className="text-sm text-secondary leading-relaxed">
          {copy.delegates.profile.noVotingPowerDescription}
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
          <TopIssues statement={delegate.statement} />
          <TopStakeholders statement={delegate.statement} />
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
