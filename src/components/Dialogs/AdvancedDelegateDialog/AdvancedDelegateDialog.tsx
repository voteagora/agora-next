import { useAccount, useBalance, useContractWrite } from "wagmi";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { VStack } from "@/components/Layout/Stack";
import { OptimismContracts } from "@/lib/contracts/contracts";
import ENSName from "@/components/shared/ENSName";
import { Button } from "@/components/Button";
import styles from "./advancedDelegateDialog.module.scss";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Delegation } from "@/app/api/delegations/delegation";
import { AdvancedDelegationDisplayAmount } from "./AdvancedDelegationDisplayAmount";
import SubdelegationToRow from "./SubdelegationRow";
import HumanAddress from "@/components/shared/HumanAddress";

// TODO: This dialog uses regular delegation layout and needs to be updated

export function AdvancedDelegateDialog({
  target,
  availableBalance,
  isDelegatingToProxy,
  delegatees,
  completeDelegation,
}: {
  target: string;
  availableBalance: string;
  isDelegatingToProxy: boolean;
  delegatees: Delegation[];
  completeDelegation: () => void;
}) {
  const { isLoading, isSuccess, isError, write } = useContractWrite({
    address: OptimismContracts.token.address as any,
    abi: OptimismContracts.token.abi,
    functionName: "delegate",
    args: [target as any],
  });
  return (
    <VStack alignItems="items-center" className={styles.dialog_container}>
      <VStack gap={6} alignItems="items-stretch">
        <VStack
          gap={3}
          alignItems="items-center"
          className={styles.details_container}
        >
          <VStack
            className={styles.amount_container}
            alignItems="items-center"
            gap={3}
          >
            <div>Total delegatable votes</div>
            <AdvancedDelegationDisplayAmount amount={availableBalance} />
          </VStack>
        </VStack>
        currently delegating to:
        <VStack
          gap={3}
          alignItems="items-center"
          className={styles.details_container}
        >
          {delegatees.map((delegatee) => (
            <SubdelegationToRow key={delegatee.to} delegation={delegatee} />
          ))}
        </VStack>
        Delegating to:
        <VStack
          gap={3}
          alignItems="items-center"
          className={styles.details_container}
        >
          <HumanAddress address={target} />
        </VStack>
        {isLoading && (
          <Button href={null} disabled={false}>
            Submitting your delegation...
          </Button>
        )}
        {isSuccess && (
          <Button href={null} disabled={false}>
            Delegation completed!
          </Button>
        )}
        {isError && (
          <Button href={null} disabled={false} onClick={() => write()}>
            Delegation failed
          </Button>
        )}
        {!isError && !isSuccess && !isLoading && (
          <Button href={null} disabled={false} onClick={() => write()}>
            Delegate your votes
          </Button>
        )}
      </VStack>
    </VStack>
  );
}
