import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { InfoIcon } from "@/icons/InfoIcon";
import { useGetDelegateDraftStatement } from "@/hooks/useGetDelegateDraftStatement";
import { useGetSafeMessageDetails } from "@/hooks/useGetSafeMessageDetails";
import { useGetSafeInfo } from "@/hooks/useGetSafeInfo";

export const DraftStatementDetails = () => {
  const { selectedWalletAddress } = useSelectedWallet();

  const { data: draftStatement, isLoading: isDraftLoading } =
    useGetDelegateDraftStatement(selectedWalletAddress);

  // Fetch safe message details if we have a message hash
  const { data: safeMessageDetails, isLoading: isMessageDetailsLoading } =
    useGetSafeMessageDetails({
      messageHash: draftStatement?.message_hash,
    });
  const { data: safeInfo } = useGetSafeInfo(selectedWalletAddress);
  const numberOfConfirmations = safeInfo?.threshold;
  // Format the date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Format the time for display
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);
  const formattedTime = formatTime(currentDate).toLowerCase();

  const confirmedSignatures = safeMessageDetails?.confirmations?.length || 1;
  const requiredSignatures = numberOfConfirmations || 3;
  const signaturesDisplay = `${confirmedSignatures}/${requiredSignatures} signatures`;

  return (
    <div className="flex flex-col bg-neutral rounded-xl shadow-newDefault py-8 px-6 mb-4">
      <div className="self-stretch inline-flex flex-col justify-start items-start gap-6">
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="flex justify-start items-center gap-2">
              <div className="w-6 h-6 relative overflow-hidden">
                <InfoIcon className="stroke-primary" />
              </div>
              <div className="justify-start text-neutral-900 text-2xl font-bold leading-loose">
                Pending signatures
              </div>
            </div>
            <div className="px-4 py-3 bg-[#fcfbf7] rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-900 flex justify-center items-center gap-2.5">
              <div className="justify-start text-neutral-900 text-base font-medium leading-normal">
                {signaturesDisplay}
              </div>
            </div>
          </div>
          <div className="self-stretch justify-start">
            <span className="text-neutral-700 text-xs font-medium leading-none">
              Changes submitted on {formattedDate} @{formattedTime}
              <br />
            </span>
            <span className="text-neutral-700 text-base font-medium leading-normal">
              Your updated delegate statement is awaiting approval. Until then,
              your public statement remains active.
            </span>
          </div>
        </div>
        <div className="inline-flex justify-start items-start gap-4">
          <button
            className="px-5 py-3 bg-white rounded-full shadow-[0px_4px_12px_0px_rgba(0,0,0,0.02)] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.03)] outline outline-1 outline-offset-[-1px] outline-neutral-900 flex justify-center items-center gap-2"
            onClick={() => {
              // Handle cancel request logic here
              console.log("Cancel request clicked");
            }}
          >
            <div className="justify-center text-neutral-900 text-base font-medium leading-normal">
              Cancel request
            </div>
          </button>
        </div>

        {isDraftLoading && (
          <p className="text-sm text-gray-500">Loading draft statement...</p>
        )}
        {isMessageDetailsLoading && (
          <p className="text-sm text-gray-500">Loading message details...</p>
        )}
      </div>
    </div>
  );
};
