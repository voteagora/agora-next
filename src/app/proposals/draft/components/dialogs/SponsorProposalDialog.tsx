import { VStack } from "@/components/Layout/Stack";

const SponsorProposalDialog = ({ redirectUrl }: { redirectUrl: string }) => {
  return (
    <VStack alignItems="items-center">
      <VStack className="w-full bg-white rounded-xl">
        <VStack className="text-xs">
          <VStack className="w-full">
            <img
              src={`/images/action-pending.svg`}
              className="w-full mb-3"
              alt="Pending"
            />
            <div className="mb-2 text-2xl font-black">
              Creating your proposal ...
            </div>
            <div className="mb-5 text-base font-medium text-gray-4f">
              It might take up to a minute for the changes to be reflected.
            </div>
            <div>
              <div className="flex flex-row justify-center w-full py-3 rounded-lg bg-gray-eo">
                <div className="text-base font-semibold text-gray-4f">
                  Writing your proposal to chain...
                </div>
              </div>
            </div>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default SponsorProposalDialog;
