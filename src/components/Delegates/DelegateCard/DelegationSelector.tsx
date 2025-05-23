import { DelegateButton } from "./DelegateButton";
import { UndelegateButton } from "./UndelegateButton";
import { useAccount } from "wagmi";
import { AdvancedDelegateButton } from "./AdvancedDelegateButton";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { UpdatedButton } from "@/components/Button";
import { ConnectKitButton } from "connectkit";
import { type SyntheticEvent } from "react";
import Tenant from "@/lib/tenant/tenant";
import { DELEGATION_MODEL } from "@/lib/constants";
import { useGetDelegatees } from "@/hooks/useGetDelegatee";
import { PartialDelegateButton } from "./PartialDelegateButton";

export function DelegationSelector({
  delegate,
  isAdvancedUser,
  delegators,
}: {
  delegate: DelegateChunk;
  isAdvancedUser: boolean;
  delegators: string[] | null;
}) {
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();

  const { contracts } = Tenant.current();
  const hasAlligator = contracts?.alligator;

  // gets the delegatees for the connected account
  const { data: delegatees } = useGetDelegatees({ address });
  const isConnectedAccountDelegate = !!delegatees?.find(
    (delegatee) => delegatee.to === delegate.address
  );

  const ButtonToShow = isConnectedAccountDelegate
    ? UndelegateButton
    : DelegateButton;

  const delegationButton = () => {
    switch (contracts.delegationModel) {
      case DELEGATION_MODEL.PARTIAL:
        return (
          <PartialDelegateButton
            full={false}
            delegate={delegate}
            isConnectedAccountDelegate={isConnectedAccountDelegate}
          />
        );
      case DELEGATION_MODEL.ADVANCED:
        if (isAdvancedUser && hasAlligator) {
          return (
            <AdvancedDelegateButton
              delegate={delegate}
              delegators={delegators}
            />
          );
        } else {
          return <ButtonToShow full={false} delegate={delegate} />;
        }
      default:
        return <ButtonToShow full={false} delegate={delegate} />;
    }
  };

  return (
    <div>
      {isConnected && address ? (
        delegationButton()
      ) : (
        <ConnectKitButton.Custom>
          {({ show }) => (
            <UpdatedButton
              type="secondary"
              onClick={(e: SyntheticEvent) => {
                e.preventDefault();
                e.stopPropagation();
                show?.();
              }}
            >
              {isConnectedAccountDelegate ? "Undelegate" : "Delegate"}
            </UpdatedButton>
          )}
        </ConnectKitButton.Custom>
      )}
    </div>
  );
}
