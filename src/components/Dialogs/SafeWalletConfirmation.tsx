import { useSafeProtocolKit } from "@/contexts/SafeProtocolKitContext";
import { useSafeApiKit } from "@/contexts/SafeApiKitContext";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";

import { Button } from "../ui/button";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { useSafePendingTransactions } from "@/hooks/useSafePendingTransactions";
import toast from "react-hot-toast";
import { useState } from "react";

export const SafeWalletConfirmationDialog = ({
  closeDialog,
  onSubmitSafeTransaction,
  data,
  address,
}: {
  closeDialog: () => void;
  onSubmitSafeTransaction?: () => void;
  data: string;
  address: string;
}) => {
  const { protocolKit } = useSafeProtocolKit();
  const { safeApiKit } = useSafeApiKit();
  const { selectedWalletAddress } = useSelectedWallet();
  const { address: accountAddress } = useAccount();
  const { slug } = Tenant.current();
  const { refetch } = useSafePendingTransactions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      const transactions = [
        {
          to: address,
          data,
          value: "0",
        },
      ];
      const nextNonce = await safeApiKit?.getNextNonce(
        selectedWalletAddress as `0x${string}`
      );

      const safeTransaction = await protocolKit?.createTransaction({
        transactions,
        onlyCalls: true,
        options: {
          nonce: Number(nextNonce),
        },
      });
      if (!safeTransaction) {
        throw new Error("Failed to create safe transaction");
      }

      const safeTxHash = await protocolKit?.getTransactionHash(safeTransaction);

      if (!safeTxHash) {
        throw new Error("Failed to get safe transaction hash");
      }

      const senderSignature = await protocolKit?.signHash(safeTxHash);
      if (!senderSignature) {
        throw new Error("Failed to sign safe transaction");
      }

      await safeApiKit?.proposeTransaction({
        safeAddress: selectedWalletAddress as `0x${string}`,
        safeTransactionData: safeTransaction?.data,
        safeTxHash: safeTxHash,
        senderAddress: accountAddress as `0x${string}`,
        senderSignature: senderSignature.data,
        origin: `Agora-${slug}`,
      });
      onSubmitSafeTransaction?.();
      refetch();
      toast.success("Transaction proposed successfully", {
        duration: 5000,
      });
    } catch (e) {
      toast.error(`Error proposing safe transaction ${e}`, {
        duration: 5000,
      });
      console.log(e);
    } finally {
      closeDialog();
    }
  };

  return (
    <div className="flex flex-col items-center w-full bg-neutral">
      <div className="flex flex-col flex-wrap justify-start gap-4 w-full">
        <p className="text-primary text-2xl font-bold leading-8">
          This action requires multi-signature approval from your Safe Wallet.
        </p>
        <p className="text-secondary font-medium leading-6">
          Once submitted, all required signers must review and approve before
          the action is finalized. Until then, the request will remain in a
          pending state.
        </p>
        <p className="text-secondary font-semibold leading-6">
          Would you like to proceed?
        </p>
        <div className="flex w-full gap-4">
          <Button
            variant="outline"
            onClick={closeDialog}
            className="flex-1 rounded-full py-3 px-5 h-12"
          >
            Cancel
          </Button>
          <Button
            variant="rounded"
            className="flex-[2] rounded-full py-3 px-5 border border-line bg-brandPrimary hover:bg-none text-neutral h-12"
            onClick={onSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            data-testid="submit-for-approval"
          >
            Submit For Approval
          </Button>
        </div>
      </div>
    </div>
  );
};
