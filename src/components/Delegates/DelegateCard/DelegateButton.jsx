import { Button } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { css } from "@emotion/css";

export function DelegateButton({ full, address, votingPower }) {
  const openDialog = useOpenDialog();

  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        openDialog({
          type: "DELEGATE",
          params: { target: address, votingPower: votingPower },
        });
      }}
      className={full ? "w-full" : undefined}
    >
      Delegate
    </Button>
  );
}
