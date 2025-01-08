import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { Button } from "@/components/Button";
import { fetchDirectDelegatee } from "@/app/delegates/actions";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";

interface Props {
  delegate: DelegateChunk;
  full: boolean;
}

export const DelegateSCWButton = ({ delegate, full }: Props) => {
  const openDialog = useOpenDialog();

  return (
    <Button
      onClick={(e: any) => {
        e.preventDefault();
        openDialog({
          type: "SWC_DELEGATE",
          params: {
            delegate,
            fetchDirectDelegatee,
          },
        });
      }}
      className={full ? "w-full" : undefined}
    >
      Delegate
    </Button>
  );
};
