import { DraftStatementDetails } from "./DelegateDraftStatement";
import { fetchDelegateStatements } from "@/app/api/common/delegateStatement/getDelegateStatement";
import { DelegateStatementsSelector } from "./DelegateStatementsSelector";
import { DelegateStatement } from "@/app/api/common/delegates/delegate";

interface Props {
  address: string;
}

const DelegateStatementWrapper = async ({ address }: Props) => {
  const delegateStatements = await fetchDelegateStatements(address);
  const delegate = delegateStatements?.[0];

  return (
    <>
      <DraftStatementDetails
        delegateStatement={delegate?.payload as any}
        address={address as `0x${string}`}
      />
      <DelegateStatementsSelector
        delegateStatements={
          delegateStatements as unknown as DelegateStatement[]
        }
      />
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
