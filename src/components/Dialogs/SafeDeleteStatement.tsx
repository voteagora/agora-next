import { useState } from "react";
import { Button } from "../ui/button";
import { deleteDelegateStatement } from "@/app/api/common/delegateStatement/deleteDelegateStatement";
import { useDelegate } from "@/hooks/useDelegate";
import toast from "react-hot-toast";
import { useGetDelegateDraftStatement } from "@/hooks/useGetDelegateDraftStatement";

export const SafeDeleteStatementDialog = ({
  closeDialog,
  address,
  messageHash,
}: {
  closeDialog: () => void;
  address: string;
  messageHash: string;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refetch: refetchStatement } = useDelegate({
    address: address as `0x${string}`,
  });

  const { refetch: refetchDraftStatement } =
    useGetDelegateDraftStatement(address);

  const deleteStatement = async () => {
    try {
      setIsSubmitting(true);
      await deleteDelegateStatement({
        address: address,
        messageHash: messageHash,
      });
      toast.success("Statement deleted successfully", {
        duration: 5000,
      });
      refetchStatement();
      refetchDraftStatement();
    } catch (e) {
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
          Cancel signature request
        </p>
        <p className="text-secondary font-medium leading-6">
          If canceled your information will default to the last approved
          version.
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
            Back
          </Button>
          <Button
            variant="rounded"
            className="flex-[2] rounded-full py-3 px-5 border border-line bg-brandPrimary hover:bg-none text-neutral h-12"
            onClick={deleteStatement}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Cancel Request
          </Button>
        </div>
      </div>
    </div>
  );
};
