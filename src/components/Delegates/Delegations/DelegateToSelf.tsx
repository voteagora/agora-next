import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import {
  fetchAllForAdvancedDelegation,
  fetchCurrentDelegatees,
  fetchDirectDelegatee,
} from "@/app/delegates/actions";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { Button } from "@/components/ui/button";
import { DELEGATION_MODEL } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";

export const DelegateToSelf = ({
  variant = "default",
  className,
  delegate,
  label = "Delegate to self",
}: {
  variant?: "rounded" | "default";
  className?: string;
  delegate: DelegateChunk;
  label?: string;
}) => {
  const { contracts } = Tenant.current();
  const hasAlligator = contracts?.alligator;
  const { isAdvancedUser } = useIsAdvancedUser();
  const openDialog = useOpenDialog();

  const onButtonClick = () => {
    if (contracts.delegationModel === DELEGATION_MODEL.PARTIAL) {
      openDialog({
        type: "PARTIAL_DELEGATE",
        params: {
          delegate,
          fetchCurrentDelegatees,
          isDelegationEncouragement: true,
        },
      });
    } else if (contracts.delegationModel === DELEGATION_MODEL.ADVANCED) {
      if (isAdvancedUser && hasAlligator) {
        openDialog({
          type: "ADVANCED_DELEGATE",
          params: {
            target: delegate.address,
            fetchAllForAdvancedDelegation,
            isDelegationEncouragement: true,
          },
        });
      }
    } else {
      openDialog({
        type: "DELEGATE",
        params: {
          delegate,
          fetchDirectDelegatee,
          isDelegationEncouragement: true,
        },
      });
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={(e: any) => {
        e.preventDefault();
        onButtonClick();
      }}
    >
      <div className="justify-center text-base font-medium">{label}</div>
    </Button>
  );
};
