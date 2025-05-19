import DelegateStatementContainer from "./DelegateStatementContainer";
import TopStakeholders from "./TopStakeholders";
import TopIssues from "./TopIssues";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { DraftStatementDetails } from "./DelegateDraftStatement";

interface Props {
  delegate: Delegate;
}

const DelegateStatementWrapper = async ({ delegate }: Props) => {
  return (
    <>
      <DraftStatementDetails delegateStatement={delegate.statement} />
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
