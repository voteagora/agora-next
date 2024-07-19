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
import { Delegation } from "@/app/api/common/delegations/delegation";
import { ChevronsRight, DivideIcon, InfoIcon, Repeat2 } from "lucide-react";
import { AgoraLoaderSmall } from "@/components/shared/AgoraLoader/AgoraLoader";
import { formatEther, formatUnits } from "viem";
import { SuccessView } from "./SuccessView";
import { track } from "@vercel/analytics";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { waitForTransaction } from "wagmi/actions";
import { CloseIcon } from "@/components/shared/CloseIcon";
import { Button } from "@/components/ui/button";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import ENSName from "@/components/shared/ENSName";
import { AdvancedDelegateDialogType } from "../DialogProvider/dialogs";
import { useModal } from "connectkit";
import { useParams } from "next/navigation";
import { resolveENSName } from "@/app/lib/ENSUtils";
import { fetchDelegate } from "@/app/delegates/actions";
import Tenant from "@/lib/tenant/tenant";

type Params = AdvancedDelegateDialogType["params"] & {
  completeDelegation: () => void;
};

type Delegatee = Omit<Delegation, "transaction_hash">;

export function AdvancedDelegateDialog({
  target,
  fetchAllForAdvancedDelegation,
  completeDelegation,
}: Params) {
  const [overflowDelegation, setOverFlowDelegation] = useState(false);
  const [allowance, setAllowance] = useState<number[]>([]);
  const [showMessage, setShowMessage] = useState(true);
  const [availableBalance, setAvailableBalance] = useState<string>("");
  const [isDelegatingToProxy, setIsDelegatingToProxy] =
    useState<boolean>(false);
  const [delegatees, setDelegatees] = useState<Delegatee[]>([]);
  const [proxyAddress, setProxyAddress] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { address } = useAccount();
  const { setRefetchDelegate } = useConnectButtonContext();
  const [isLoading, setIsLoading] = useState(false);
  const [opBalance, setOpBalance] = useState<bigint>(0n);
  const [delegators, setDelegators] = useState<Delegation[]>();
  const [directDelegatedVP, setDirectDelegatedVP] = useState<bigint>(0n);
  const { setOpen } = useModal();
  const params = useParams<{ addressOrENSName: string }>();
  const { slug } = Tenant.current();

  const fetchData = useCallback(async () => {
    try {
      if (!address) return;

      // @ts-ignore
      const [
        balance,
        isDelegating,
        delegatees,
        proxyAddress,
        delegatorsRes,
        directDelegatedVP,
      ] = await fetchAllForAdvancedDelegation(address);

      setDirectDelegatedVP(directDelegatedVP);
      setAvailableBalance(balance);
      setIsDelegatingToProxy(isDelegating);
      setOpBalance(directDelegatedVP);
      setDelegators(delegatorsRes);

      let isTargetDelegated = false;

      const initialAllowance = delegatees.map((delegation: Delegation) => {
        if (!isTargetDelegated) {
          isTargetDelegated = delegation.to === target.toLowerCase();
        }

        return (
          Math.round(
            Number(formatUnits(BigInt(delegation.allowance), 18)) * 1000
          ) / 1000
        );
      });

      const initAllowance = [...initialAllowance];
      if (!isTargetDelegated) {
        // ADD 0 for the target
        initAllowance.push(0);
        (delegatees as Delegatee[]).push({
          from: address,
          to: target,
          allowance: "0",
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
  }, [address, fetchAllForAdvancedDelegation, target]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { writeAsync, isError, isSuccess, data } = useAdvancedDelegation({
    availableBalance,
    isDelegatingToProxy,
    proxyAddress,
    // target can be a string or an array of strings
    target: delegatees.map((delegation: Delegatee) => delegation.to),
    // alowance can be a number or an array of numbers
    allocation: allowance, // (value / 100000) 100% = 100000
  });

  const getVotingPowerPageDelegatee = async () => {
    const pageDelegateeAddress = await resolveENSName(
      params?.addressOrENSName as string
    );
    const pageDelegateeIndex = delegatees.findIndex(
      (delegatee) => delegatee.to === pageDelegateeAddress
    );
    const prevVotingPower = Number(
      formatEther(BigInt(delegatees[pageDelegateeIndex].allowance))
    ).toFixed(2);
    const postVotingPower = allowance[pageDelegateeIndex].toFixed(2);

    return {
      pageDelegateeAddress,
      prevVotingPower,
      postVotingPower,
    };
  };
  const writeWithTracking = async () => {
    setIsLoading(true);

    const trackingData = {
      dao_slug: slug,
      userAddress: address || "unknown",
      proxyAddress: proxyAddress || "unknown",
      targetDelegation: target || "unknown",
      totalDelegatees: delegatees.length || "unknown",
      totalVotingPower: availableBalance,
    };

    track("Advanced Delegation", trackingData);

    const tx = await writeAsync();
    await waitForTransaction({ hash: tx.hash });

    const { prevVotingPower, postVotingPower, pageDelegateeAddress } =
      await getVotingPowerPageDelegatee();

    if (prevVotingPower !== postVotingPower) {
      const delegatee = await fetchDelegate(pageDelegateeAddress);
      setRefetchDelegate({
        address: pageDelegateeAddress,
        prevVotingPowerDelegatee: delegatee.votingPower.total,
      });
    } else {
      /**
       * No need to revalidate the delegate page since there were no changes, only the profile dropdown needs to be updated
       */
      setRefetchDelegate({
        address: pageDelegateeAddress,
      });
    }
    setIsLoading(false);
  };

  return (
    <>
      <VStack
        justifyContent="justify-center"
        alignItems="items-center"
        className={styles.box}
      >
        {showMessage ? (
          <div>
            <Message setShowMessage={setShowMessage} />
          </div>
        ) : (
          <div className="block w-full">
            {!isLoading && isSuccess ? (
              <SuccessView closeDialog={completeDelegation} data={data} />
            ) : isReady &&
              availableBalance !== "" &&
              !!delegatees &&
              proxyAddress !== "" ? (
              <VStack className={styles.dialog_container} gap={1}>
                <VStack className={styles.amount_container}>
                  <HStack alignItems="items-center" gap={1}>
                    Your total delegatable votes{" "}
                    <InfoIcon
                      size={12}
                      className="cursor-pointer opacity-70"
                      onClick={() => setShowInfo(true)}
                    />
                  </HStack>
                  <AdvancedDelegationDisplayAmount amount={availableBalance} />
                </VStack>
                <VStack
                  className={`overflow-y-scroll ${overflowDelegation ? "max-h-[240px] sm:max-h-[400px]" : "max-h-[400px]"}`}
                >
                  {delegatees.map((delegatee, index) => (
                    <SubdelegationToRow
                      key={index}
                      to={delegatee.to}
                      availableBalance={availableBalance}
                      setAllowance={setAllowance}
                      allowances={allowance}
                      index={index}
                      setOverFlowDelegation={setOverFlowDelegation}
                    />
                  ))}
                </VStack>

                {showInfo && (
                  <InfoDialog
                    setShowInfo={setShowInfo}
                    availableBalance={availableBalance}
                    balance={opBalance || 0n}
                    delegators={delegators}
                    directDelegatedVP={directDelegatedVP}
                  />
                )}
                {address ? (
                  isError ? (
                    <Button
                      disabled={false}
                      className="mt-3"
                      onClick={() => writeWithTracking()}
                    >
                      Delegation failed
                    </Button>
                  ) : isLoading ? (
                    <Button disabled={false} className="mt-3">
                      Submitting your delegation...
                    </Button>
                  ) : (
                    <Button
                      disabled={false}
                      className="mt-3"
                      onClick={() => writeWithTracking()}
                    >
                      Delegate your votes
                    </Button>
                  )
                ) : (
                  <Button className="mt-3" onClick={() => setOpen(true)}>
                    Connect wallet to delegate
                  </Button>
                )}
              </VStack>
            ) : (
              <VStack
                className="w-full h-[318px]"
                alignItems="items-center"
                justifyContent="justify-center"
              >
                <AgoraLoaderSmall />
              </VStack>
            )}
          </div>
        )}
      </VStack>
      {overflowDelegation && (
        <p
          className="text-xs bg-gray-fa p-6 pb-3 pt-6 mt-3 left-0 max-w-md rounded-bl-xl rounded-br-xl absolute"
          style={{ transform: "translateZ(-1px)" }}
        >
          You have delegated more than the total delegatable votes you have.
          Please reduce your current delegation before delegating more
        </p>
      )}
    </>
  );
}

function InfoDialog({
  setShowInfo,
  availableBalance,
  balance,
  delegators,
  directDelegatedVP,
}: {
  setShowInfo: Dispatch<any>;
  availableBalance: string;
  balance: bigint;
  delegators: Delegation[] | undefined;
  directDelegatedVP: bigint;
}) {
  const directDelegatedFromOthers = BigInt(directDelegatedVP) - BigInt(balance);
  return (
    <div className="absolute w-full bg-white rounded-lg shadow-newDefault">
      <VStack className={styles.amount_container + " !pb-0 !px-0"}>
        <div
          className="absolute cursor-pointer top-2 right-2 opacity-80"
          onClick={() => setShowInfo(false)}
        >
          <CloseIcon className="w-4" />
        </div>
        <HStack alignItems="items-center" gap={1}>
          Your total delegatable votes{" "}
          <InfoIcon size={12} className="opacity-50" />
        </HStack>
        <AdvancedDelegationDisplayAmount amount={availableBalance} />
        <VStack
          className="w-[95%] py-4 mx-auto mt-4 border-t border-dashed border-gray-eo max-h-[256px] overflow-y-scroll"
          alignItems="items-start"
          gap={3}
        >
          <HStack
            alignItems="items-center"
            justifyContent="justify-between"
            className="w-full"
          >
            <p>You own</p>
            <TokenAmountDisplay amount={balance} />
          </HStack>
          {delegators?.map((delegator, index) => (
            <HStack
              alignItems="items-center"
              justifyContent="justify-between"
              className="w-full"
              key={index}
            >
              <p>
                <ENSName address={delegator.from} />
                &apos;s delegation
              </p>
              <TokenAmountDisplay amount={BigInt(delegator.allowance)} />
            </HStack>
          ))}
        </VStack>
        {directDelegatedFromOthers > 0n && (
          <p className="w-full p-3 text-xs font-medium leading-4 border-t text-gray-af border-gray-eo">
            You’ve been delegated an additional{" "}
            <TokenAmountDisplay amount={directDelegatedFromOthers} /> without
            the right to redelegate. You can only vote with this portion of
            votes and cannot pass them to others.
          </p>
        )}
      </VStack>
    </div>
  );
}

function Message({
  setShowMessage,
}: {
  setShowMessage: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className={styles.dialog_container}>
      <VStack gap={4}>
        <VStack gap={1}>
          <div className={styles.title}>Welcome to advanced delegation</div>
          <div className={styles.gray}>
            As a large token holder, you now have access to advanced delegation,
            which lets you manage your voting power with more control and
            flexibility.
          </div>
        </VStack>

        <VStack gap={3} className={styles.info_container}>
          <div className={styles.icon_text}>
            <DivideIcon size={20} />
            <p>Split your delegation to multiple people</p>
          </div>
          <div className={styles.icon_text}>
            <Repeat2 size={20} />
            <p>Let your delegates re-delegate</p>
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
