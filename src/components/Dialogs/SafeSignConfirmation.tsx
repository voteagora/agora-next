import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { useState } from "react";

export const SafeSignConfirmationDialog = ({
  closeDialog,
  onSubmit,
}: {
  closeDialog: () => void;
  onSubmit?: () => Promise<void>;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSignInConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit?.();
      toast.success("Signed Message successfully", {
        duration: 5000,
      });
    } catch (e) {
      toast.error(`Error signing message ${e}`, {
        duration: 5000,
      });
      console.log(e);
    } finally {
      setIsSubmitting(false);
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
            onClick={onSignInConfirm}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Sign Message
          </Button>
        </div>
      </div>
    </div>
  );
};
