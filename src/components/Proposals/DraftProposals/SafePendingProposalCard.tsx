import { SafeTxnTooltip } from "@/components/shared/SafeTxnTooltip";

type SafePendingProposalCardProps = {
  proposal: {
    description: string;
    status: string;
    type: string;
    transaction: any;
    title: string;
  };
  txHash: string;
};

export const SafePendingProposalCard = ({
  proposal,
  txHash,
}: SafePendingProposalCardProps) => {
  const isPendingExecution =
    proposal.transaction.confirmations.length ===
    proposal.transaction.confirmationsRequired;
  console.log("isPendingExecution", isPendingExecution);
  return (
    <div className="bg-wash border border-line rounded-2xl p-2 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between bg-neutral border border-line rounded-2xl px-6 py-5 shadow-sm flex-wrap sm:flex-normal">
        <div>
          <p className="font-semibold text-secondary text-xs">
            {`By ${proposal.transaction.proposer}`}
          </p>
          <p className="font-medium text-primary">
            {proposal.title || "[Title pending]"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 mt-4 sm:mt-0 sm:gap-x-4 gap-x-1">
          <div className="w-[140px]">
            <p className="font-semibold text-secondary text-xs">{`Status`}</p>
            <SafeTxnTooltip>
              {!isPendingExecution ? (
                <p className="font-medium text-positive">
                  Pending {proposal.status}
                </p>
              ) : (
                <p className="font-medium text-primary">Ready</p>
              )}
            </SafeTxnTooltip>
          </div>
          <div className="w-[140px]">
            <p className="font-semibold text-secondary text-xs">Type</p>
            <p className="font-medium text-primary">{proposal.type}</p>
          </div>
          <div className="w-[140px]">
            <p className="font-semibold text-secondary text-xs">{`Waiting for`}</p>
            <p className="font-medium text-primary">
              {isPendingExecution ? "Safe execution" : "Safe approvals"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between px-6 pt-2">
        <div className="w-full">
          <div className="flex flex-row items-center my-2">
            <div className="h-1 w-1 rounded-full bg-stone-700"></div>
            <div className="w-full h-px bg-stone-700"></div>
          </div>

          <p className="text-xs font-medium text-secondary">Create draft</p>
        </div>
        <div className="w-full">
          <div className="flex flex-row items-center my-2">
            <div className="h-1 w-1 rounded-full bg-stone-700"></div>
            <div className="w-full h-px bg-stone-700"></div>
          </div>

          <p className="text-xs font-medium text-secondary">Submit draft</p>
        </div>
        <div className="w-full">
          <div className="flex flex-row items-center my-2">
            <div className="h-1 w-1 rounded-full bg-stone-700"></div>
            <div className="w-full h-px bg-stone-700"></div>
          </div>

          <p className="text-xs font-medium text-secondary">Pending</p>
        </div>
        <div className="w-full">
          <div className="flex flex-row items-center my-2">
            <div className="h-1 w-1 rounded-full bg-stone-300"></div>
            <div className="w-full h-px bg-stone-300"></div>
          </div>

          <p className="text-xs font-medium text-secondary">Queue</p>
        </div>
        <div className="w-full">
          <div className="flex flex-row items-center my-2">
            <div className="h-1 w-1 rounded-full bg-stone-300"></div>
            <div className="w-full h-px bg-stone-300"></div>
          </div>

          <p className="text-xs font-medium text-secondary">Execute</p>
        </div>
      </div>
    </div>
  );
};
