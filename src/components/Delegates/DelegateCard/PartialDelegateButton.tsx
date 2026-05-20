import { UpdatedButton } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "@/lib/types/delegate";
import { fetchCurrentDelegatees } from "@/server/delegates/actions";

interface Props {
  full: boolean;
  delegate: DelegateChunk;
  isConnectedAccountDelegate: boolean;
}

export const PartialDelegateButton = ({
  full,
  delegate,
  isConnectedAccountDelegate,
}: Props) => {
  const openDialog = useOpenDialog();

  return (
    <UpdatedButton
      type={isConnectedAccountDelegate ? "primary" : "secondary"}
      onClick={(e: any) => {
        e.preventDefault();
        e.stopPropagation();
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
      {isConnectedAccountDelegate ? "Undelegate" : "Delegate"}
    </UpdatedButton>
  );
};
