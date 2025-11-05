"use client";

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
import { DivideIcon, InfoIcon, Repeat2 } from "lucide-react";
import {
  AgoraLoaderSmall,
  LogoLoader,
} from "@/components/shared/AgoraLoader/AgoraLoader";
import { formatEther, formatUnits } from "viem";
import { SuccessView } from "./SuccessView";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { waitForTransactionReceipt } from "wagmi/actions";
import { CloseIcon } from "@/components/shared/CloseIcon";
import { Button } from "@/components/ui/button";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import ENSName from "@/components/shared/ENSName";
import { AdvancedDelegateDialogType } from "../DialogProvider/dialogs";
import { useModal } from "connectkit";
import { useParams } from "next/navigation";
import { resolveENSName } from "@/app/lib/ENSUtils";
import { fetchDelegate } from "@/app/delegates/actions";
import Tenant from "@/lib/tenant/tenant";
import { config } from "@/app/Web3Provider";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types";

type Params = AdvancedDelegateDialogType["params"] & {
  completeDelegation: () => void;
  isDelegationEncouragement?: boolean;
};

type Delegatee = Omit<Delegation, "transaction_hash">;

export function AdvancedDelegateDialog({
  target,
  fetchAllForAdvancedDelegation,
  completeDelegation,
  isDelegationEncouragement,
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
  const { ui, slug } = Tenant.current();
  const shouldHideAgoraBranding = ui.hideAgoraBranding;

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
          percentage: "0",
          timestamp: null,
          type: "ADVANCED",
          amount: "PARTIAL",
        });
      }

      setAllowance(initAllowance);
      setDelegatees(delegatees);
      setProxyAddress(proxyAddress || "");

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
      params?.addressOrENSName || target
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

    const tx = await writeAsync();
    await waitForTransactionReceipt(config, { hash: tx });
    trackEvent({
      event_name: ANALYTICS_EVENT_NAMES.ADVANCED_DELEGATE,
      event_data: {
        delegatees: delegatees,
        delegator: address as `0x${string}`,
        transaction_hash: tx,
      },
    });
    if (isDelegationEncouragement) {
      trackEvent({
        event_name: ANALYTICS_EVENT_NAMES.DELEGATION_ENCOURAGEMENT_CTA,
        event_data: {
          delegator: address as `0x${string}`,
          transaction_hash: tx,
        },
      });
    }

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
      <div className="flex flex-col w-full justify-center items-center">
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
              <div className="flex flex-col relative gap-1">
                <div className="flex flex-col text-xs border border-line rounded-lg justify-center items-center py-8 px-2 relative">
                  <div className="flex flex-row items-center gap-1">
                    Your total delegatable votes{" "}
                    <InfoIcon
                      size={12}
                      className="cursor-pointer opacity-70"
                      onClick={() => setShowInfo(true)}
                    />
                  </div>
                  <AdvancedDelegationDisplayAmount amount={availableBalance} />
                </div>
                <div
                  className={`flex flex-col overflow-y-scroll ${overflowDelegation ? "max-h-[240px] sm:max-h-[400px]" : "max-h-[400px]"}`}
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
                </div>

                {showInfo && (
                  <InfoDialog
                    setShowInfo={setShowInfo}
                    availableBalance={availableBalance}
                    balance={opBalance || 0n}
                    delegators={delegators}
                    directDelegatedVP={directDelegatedVP}
                  />
                )}

                {overflowDelegation && (
                  <div className="text-xs max-w-md rounded-bl-xl mt-4">
                    You have delegated more than the total delegatable votes you
                    have. Please reduce your current delegation before
                    delegating more
                  </div>
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
              </div>
            ) : (
              <div className="flex flex-col w-full h-[318px] items-center justify-center">
                {shouldHideAgoraBranding ? (
                  <LogoLoader />
                ) : (
                  <AgoraLoaderSmall />
                )}
              </div>
            )}
          </div>
        )}
      </div>
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
    <div className="absolute w-full bg-neutral rounded-lg shadow-newDefault">
      <div
        className={
          "flex flex-col text-xs border border-line rounded-lg justify-center items-center py-8 px-2 relative" +
          " !pb-0 !px-0"
        }
      >
        <div
          className="absolute cursor-pointer top-2 right-2 opacity-80"
          onClick={() => setShowInfo(false)}
        >
          <CloseIcon className="w-4" />
        </div>
        <div className="flex flex-row items-center gap-1">
          Your total delegatable votes{" "}
          <InfoIcon size={12} className="opacity-50" />
        </div>
        <AdvancedDelegationDisplayAmount amount={availableBalance} />
        <div className="flex flex-col items-start gap-3 w-[95%] py-4 mx-auto mt-4 border-t border-dashed border-line max-h-[256px] overflow-y-scroll">
          <div className="flex flex-row w-full items-center justify-between">
            <p>You own</p>
            <TokenAmountDecorated amount={balance} />
          </div>
          {delegators?.map((delegator, index) => (
            <div
              className="flex flex-row w-full items-center justify-between text-primary"
              key={index}
            >
              <p>
                <ENSName address={delegator.from} />
                &apos;s delegation
              </p>
              <TokenAmountDecorated amount={BigInt(delegator.allowance)} />
            </div>
          ))}
        </div>
        {directDelegatedFromOthers > 0n && (
          <p className="w-full p-3 text-xs font-medium leading-4 border-t text-primary/30 border-line">
            You’ve been delegated an additional{" "}
            <TokenAmountDecorated amount={directDelegatedFromOthers} /> without
            the right to redelegate. You can only vote with this portion of
            votes and cannot pass them to others.
          </p>
        )}
      </div>
    </div>
  );
}

function Message({
  setShowMessage,
}: {
  setShowMessage: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="relative">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-primary text-xl font-bold">
            Welcome to advanced delegation
          </div>
          <div className="text-secondary">
            As a large token holder, you now have access to advanced delegation,
            which lets you manage your voting power with more control and
            flexibility.
          </div>
        </div>

        <div className="flex flex-col gap-3 border border-line rounded-lg p-4">
          <div className="flex items-center">
            <DivideIcon size={20} className="mr-2 text-red-500" />
            <p>Split your delegation to multiple people</p>
          </div>
          <div className="flex items-center">
            <Repeat2 size={20} className="mr-2 text-red-500" />
            <p>Let your delegates re-delegate</p>
          </div>
        </div>
        <Button
          className="bg-black text-neutral text-center w-full h-full"
          onClick={() => {
            setShowMessage(false);
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
