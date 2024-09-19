import { Button } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { fetchCurrentDelegatees } from "@/app/delegates/actions";

interface Props {
  full: boolean;
  delegate: DelegateChunk;
}

export const PartialDelegateButton = ({ full, delegate }: Props) => {
  const openDialog = useOpenDialog();

  return (
    <Button
      onClick={(e: any) => {
        e.preventDefault();
        openDialog({
          type: "PARTIAL_DELEGATE",
          params: {
            delegate,
            fetchCurrentDelegatees,
          },
        });
      }}
      className={full ? "w-full" : undefined}
    >
      Delegate
    </Button>
  );
};
