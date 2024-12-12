import { fetchDelegate } from "@/app/delegates/actions";
import { resolveENSName } from "@/app/lib/ENSUtils";
import DelegateStatementContainer from "./DelegateStatementContainer";
import TopStakeholders from "./TopStakeholders";
import TopIssues from "./TopIssues";

const DelegateStatementWrapper = async ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) => {
  const address = await resolveENSName(addressOrENSName);
  const delegate = await fetchDelegate(address);

  return (
    <>
      <DelegateStatementContainer
        addressOrENSName={addressOrENSName}
        statement={delegate.statement}
      />
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
