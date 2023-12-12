import { VStack } from "@/components/Layout/Stack";
import { Button } from "@/components/Button";
import styles from "./advancedDelegateDialog.module.scss";
import { Delegation } from "@/app/api/delegations/delegation";
import { AdvancedDelegationDisplayAmount } from "./AdvancedDelegationDisplayAmount";
import SubdelegationToRow from "./SubdelegationRow";
import HumanAddress from "@/components/shared/HumanAddress";
import useAdvancedDelegation from "./useAdvancedDelegation";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function AdvancedDelegateDialog({
  target,
  availableBalance,
  isDelegatingToProxy,
  proxyAddress,
  delegatees,
  completeDelegation,
}: {
  target: string;
  availableBalance: string;
  isDelegatingToProxy: boolean;
  proxyAddress: string;
  delegatees: Delegation[];
  completeDelegation: () => void;
}) {
  const [allowance, setAllowance] = useState(0);

  const { write, isLoading, isError, isSuccess } = useAdvancedDelegation({
    isDelegatingToProxy,
    proxyAddress,
    // target can be a string or an array of strings
    target,
    // alowance can be a number or an array of numbers
    allocation: allowance, // (value / 100000) 100% = 100000
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
          <Input
            value={allowance}
            onChange={(e) => setAllowance(parseInt(e.target.value))}
            type="number"
          />
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
