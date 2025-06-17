import { DSButton } from "@/components/design-system/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { fetchCurrentDelegatees } from "@/app/delegates/actions";

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
    <DSButton
      variant={isConnectedAccountDelegate ? "primary" : "secondary"}
      size="small"
      fullWidth={full}
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
      {isConnectedAccountDelegate ? "Undelegate" : "Delegate"}
    </DSButton>
  );
};
