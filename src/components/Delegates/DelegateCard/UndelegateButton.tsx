import { DSButton } from "@/components/design-system/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import {
  fetchDirectDelegatee,
  fetchBalanceForDirectDelegation,
} from "@/app/delegates/actions";

export function UndelegateButton({
  full,
  delegate,
}: {
  full: boolean;
  delegate: DelegateChunk;
}) {
  const openDialog = useOpenDialog();

  return (
    <DSButton
      variant="secondary"
      size="large"
      fullWidth={full}
      onClick={(e: any) => {
        e.preventDefault();
        openDialog({
          type: "UNDELEGATE",
          params: {
            delegate,
            fetchBalanceForDirectDelegation,
            fetchDirectDelegatee,
          },
        });
      }}
    >
      Undelegate
    </DSButton>
  );
}
