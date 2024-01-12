import { Button } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "../DelegateCardList/DelegateCardList";
import { Delegatees } from "@prisma/client";

type Props = {
  full: boolean;
  delegate: DelegateChunk;
  fetchBalanceForDirectDelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  fetchDirectDelegatee: (addressOrENSName: string) => Promise<Delegatees>;
};
export function DelegateButton({
  full,
  delegate,
  fetchBalanceForDirectDelegation,
  fetchDirectDelegatee,
}: Props) {
  const openDialog = useOpenDialog();

  return (
    <Button
      onClick={(e: any) => {
        e.preventDefault();
        openDialog({
          type: "DELEGATE",
          params: {
            delegate,
            fetchBalanceForDirectDelegation,
            fetchDirectDelegatee,
          },
        });
      }}
      className={full ? "w-full" : undefined}
    >
      Delegate
    </Button>
  );
}
