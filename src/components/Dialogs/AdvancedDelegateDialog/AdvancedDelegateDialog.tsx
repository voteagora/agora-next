import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "./advancedDelegateDialog.module.scss";
import { AdvancedDelegationDisplayAmount } from "./AdvancedDelegationDisplayAmount";
import SubdelegationToRow from "./SubdelegationRow";
import useAdvancedDelegation from "./useAdvancedDelegation";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useAccount } from "wagmi";
import { Delegation } from "@/app/api/delegations/delegation";
import { ChevronsRight, DivideIcon, InfoIcon, Repeat2 } from "lucide-react";
import { AgoraLoaderSmall } from "@/components/shared/AgoraLoader/AgoraLoader";
import { formatUnits } from "viem";
import { Button } from "@/components/Button";
import { SuccessView } from "./SuccessView";

export function AdvancedDelegateDialog({
  target,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
  completeDelegation,
}: {
  target: string;
  fetchVotingPowerForSubdelegation: (address: string) => Promise<string>;
  checkIfDelegatingToProxy: (address: string) => Promise<boolean>;
  fetchCurrentDelegatees: (address: string) => Promise<any>;
  getProxyAddress: (address: string) => Promise<string>;
  completeDelegation: () => void;
}) {
  const [allowance, setAllowance] = useState<number[]>([]);
  const [showMessage, setShowMessage] = useState(true);
  const [availableBalance, setAvailableBalance] = useState<string>("");
  const [isDelegatingToProxy, setIsDelegatingToProxy] =
    useState<boolean>(false);
  const [delegatees, setDelegatees] = useState<Delegation[]>([]);
  const [proxyAddress, setProxyAddress] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const { address } = useAccount();

  const fetchData = useCallback(async () => {
    try {
      if (!address) return;
      const promises = [
        fetchVotingPowerForSubdelegation(address),
        checkIfDelegatingToProxy(address),
        fetchCurrentDelegatees(address),
        getProxyAddress(address),
      ];

      const [balance, isDelegating, delegatees, proxyAddress] =
        await Promise.all(promises);

      setAvailableBalance(balance);
      setIsDelegatingToProxy(isDelegating);
      let isTargetDelegated = false;

      const initialAllowance = delegatees.map((delegation: Delegation) => {
        if (!isTargetDelegated) {
          isTargetDelegated = delegation.to === target.toLowerCase();
        }

        return parseInt(formatUnits(BigInt(delegation.allowance), 18));
      });

      const initAllowance = [...initialAllowance];
      if (!isTargetDelegated) {
        // ADD 0 for the target
        initAllowance.push(0);
        delegatees.push({
          from: address,
          to: target,
          allowance: 0,
          timestamp: null,
          type: "ADVANCED",
          amount: "PARTIAL",
        });
      }

      setAllowance(initAllowance);
      setDelegatees(delegatees);
      setProxyAddress(proxyAddress);

      setIsReady(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [
    address,
    fetchVotingPowerForSubdelegation,
    checkIfDelegatingToProxy,
    fetchCurrentDelegatees,
    getProxyAddress,
    target,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { write, isLoading, isError, isSuccess } = useAdvancedDelegation({
    availableBalance,
    isDelegatingToProxy,
    proxyAddress,
    // target can be a string or an array of strings
    target: delegatees.map((delegation: Delegation) => delegation.to),
    // alowance can be a number or an array of numbers
    allocation: allowance, // (value / 100000) 100% = 100000
  });

  return (
    <VStack
      justifyContent="justify-center"
      alignItems="items-center"
      className={styles.box}
    >
      <div className={showMessage ? "block" : "hidden"}>
        <Message setShowMessage={setShowMessage} />
      </div>
      <div className={showMessage ? "hidden" : "block w-full"}>
        {isSuccess ? (
          <SuccessView closeDialog={completeDelegation} />
        ) : isReady &&
          availableBalance !== "" &&
          !!delegatees &&
          proxyAddress !== "" ? (
          <VStack className={styles.dialog_container} gap={1}>
            <VStack className={styles.amount_container}>
              <HStack alignItems="items-center" gap={1}>
                Your total delegatable votes <InfoIcon size={16} />
              </HStack>
              <AdvancedDelegationDisplayAmount amount={availableBalance} />
            </VStack>
            <VStack className={styles.details_container}>
              {delegatees.map((delegatee, index) => (
                <SubdelegationToRow
                  key={index}
                  to={delegatee.to}
                  availableBalance={availableBalance}
                  setAllowance={setAllowance}
                  allowances={allowance}
                  index={index}
                />
              ))}
            </VStack>

            {isLoading && (
              <Button disabled={false}>Submitting your delegation...</Button>
            )}
            {isError && (
              <Button disabled={false} onClick={() => write()}>
                Delegation failed
              </Button>
            )}
            {!isError && !isLoading && (
              <Button disabled={false} onClick={() => write()}>
                Delegate your votes
              </Button>
            )}
          </VStack>
        ) : (
          <VStack
            className="w-full h-full"
            alignItems="items-center"
            justifyContent="justify-center"
          >
            <AgoraLoaderSmall />
          </VStack>
        )}
      </div>
    </VStack>
  );
}

function Message({
  setShowMessage,
}: {
  setShowMessage: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className={styles.dialog_container}>
      <VStack gap={3}>
        <div className={styles.title}>Welcome to advanced delegation</div>
        <div className={styles.subtitle}>
          {" "}
          As a large token holder, your account now has access to advanced
          delegation. This lets you delegate your voting power with more control
          and flexibility than ever before.{" "}
        </div>

        <VStack gap={3} className={styles.info_container}>
          <div className={styles.icon_text}>
            <DivideIcon size={20} />
            <p>Split your delegation to multiple people</p>
          </div>
          <div className={styles.icon_text}>
            <Repeat2 size={20} />
            <p>Let your delegates re-delegate</p>
          </div>
          <div className={styles.icon_text}>
            <ChevronsRight size={20} />
            <p>Might require two transactions to vote</p>
          </div>
        </VStack>
        <Button
          className={styles.continue_button}
          onClick={() => {
            setShowMessage(false);
          }}
        >
          Continue
        </Button>
      </VStack>
    </div>
  );
}
