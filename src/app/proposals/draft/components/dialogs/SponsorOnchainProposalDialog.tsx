import { VStack } from "@/components/Layout/Stack";
import { useRouter } from "next/navigation";
import { useWaitForTransaction } from "wagmi";
import Image from "next/image";
import Link from "next/link";
import { icons } from "@/assets/icons/icons";
import Tenant from "@/lib/tenant/tenant";

const SponsorOnchainProposalDialog = ({
  redirectUrl,
  txHash,
  closeDialog,
}: {
  redirectUrl: string;
  txHash: `0x${string}`;
  closeDialog: () => void;
}) => {
  const tenant = Tenant.current();
  const { isLoading } = useWaitForTransaction({
    hash: txHash,
  });
  const router = useRouter();
  return (
    <VStack alignItems="items-center">
      <VStack className="w-full bg-white rounded-xl">
        <VStack>
          <VStack className="w-full">
            <img
              src={`/images/action-pending.svg`}
              className="w-full mb-3"
              alt="Pending"
            />
            <div className="mb-2 text-2xl font-black">
              {isLoading ? "Creating your proposal ..." : "Proposal complete!"}
            </div>
            {isLoading ? (
              <div className="mb-5 text-base font-medium text-gray-4f">
                It might take up to a minute for the changes to be reflected.
              </div>
            ) : (
              <div className="flex flex-row justify-between items-center mt-2 mb-4">
                <span className="text-agora-stone-700">Transaction hash</span>
                <div className="flex flex-row items-center space-x-2">
                  <Link href={`${tenant.blockExplorer}/tx/${txHash}`}>
                    <Image
                      src={icons.link}
                      height="16"
                      width="16"
                      alt="link icon"
                    />
                  </Link>
                </div>
              </div>
            )}
            <div>
              <div className="flex flex-row justify-center w-full py-3 rounded-lg bg-gray-eo">
                {isLoading ? (
                  <div className="text-base font-semibold text-gray-4f">
                    Writing your proposal to chain...
                  </div>
                ) : (
                  <div
                    className="text-base font-semibold text-gray-4f cursor-pointer"
                    onClick={() => {
                      router.push(redirectUrl);
                      closeDialog();
                    }}
                  >
                    Continue
                  </div>
                )}
              </div>
            </div>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default SponsorOnchainProposalDialog;
