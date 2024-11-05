import { useAccount, useEnsName } from "wagmi";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/Button";
import { Button as ShadcnButton } from "@/components/ui/button";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useCallback, useEffect, useState } from "react";
import {
  AgoraLoaderSmall,
  LogoLoader,
} from "@/components/shared/AgoraLoader/AgoraLoader";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { AdvancedDelegationDisplayAmount } from "../AdvancedDelegateDialog/AdvancedDelegationDisplayAmount";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { DelegateePayload } from "@/app/api/common/delegations/delegation";
import Tenant from "@/lib/tenant/tenant";
import { DelegateButton } from "@/components/Dialogs/DelegateDialog/DelegateButton";
import { useDelegate } from "@/hooks/useDelegate";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import { SCWDelegateButton } from "@/components/Dialogs/DelegateDialog/SCWDelegateButton";

export function DelegateDialog({
  delegate,
  fetchBalanceForDirectDelegation,
  fetchDirectDelegatee,
}: {
  delegate: DelegateChunk;
  fetchBalanceForDirectDelegation: (
    addressOrENSName: string
  ) => Promise<bigint>;
  fetchDirectDelegatee: (
    addressOrENSName: string
  ) => Promise<DelegateePayload | null>;
}) {
  const { ui, contracts, token } = Tenant.current();

  const shouldHideAgoraBranding = ui.hideAgoraBranding;

  const { address } = useAccount();
  const { data: delegator } = useDelegate({ address: address });

  const [votingPower, setVotingPower] = useState<string>("");
  const [accountAddress, setAccountAddress] = useState("");

  const [status, setStatus] = useState<"error" | "loading" | undefined>();
  const [txnHash, setTxnHash] = useState<string | undefined>();

  const [delegatee, setDelegatee] = useState<DelegateePayload | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { setRefetchDelegate } = useConnectButtonContext();
  const sameDelegatee = delegate.address === delegatee?.delegatee;

  const isDisabledInTenant = ui.toggle("delegates/delegate")?.enabled === false;

  const { data: delegateEnsName } = useEnsName({
    chainId: 1,
    address: delegate.address as `0x${string}`,
  });

  const { data: delegateeEnsName } = useEnsName({
    chainId: 1,
    address: delegatee?.delegatee as `0x${string}`,
  });

  const fetchData = useCallback(async () => {
    setIsReady(false);
    if (!accountAddress) return;

    try {
      const vp = await fetchBalanceForDirectDelegation(accountAddress);
      setVotingPower(vp.toString());

      const direct = await fetchDirectDelegatee(accountAddress);
      setDelegatee(direct);
    } finally {
      setIsReady(true);
    }
  }, [fetchBalanceForDirectDelegation, accountAddress, fetchDirectDelegatee]);

  const renderActionButtons = () => {
    if (isDisabledInTenant) {
      return (
        <Button disabled={true}>
          {token.symbol} delegation is disabled at this time
        </Button>
      );
    }

    if (sameDelegatee) {
      return (
        <ShadcnButton variant="outline" className="cursor-not-allowed">
          You cannot delegate to the same address again
        </ShadcnButton>
      );
    }

    // TODO: Fix this
    // if (status === "error" && delegator) {
    //   return (
    //     <DelegateButton
    //       delegate={delegate}
    //       delegator={delegator}
    //       onChange={(status) => setStatus(status)}
    //     />
    //   );
    // }

    if (status === "loading") {
      return <Button disabled={true}>Submitting your delegation...</Button>;
    }

    if (txnHash) {
      return (
        <div>
          <Button className="w-full" disabled={false}>
            Delegation completed!
          </Button>
          {/*TODO: Fix data */}
          <BlockScanUrls hash1={txnHash} />
        </div>
      );
    }

    if (delegator) {
      return (
        <SCWDelegateButton
          delegate={delegate}
          delegator={delegator}
          onSuccess={(txn) => setTxnHash(txn)}
          onChange={(status) => setStatus(status)}
        />
        // <DelegateButton
        //   delegate={delegate}
        //   delegator={delegator}
        //   onChange={(status) => setStatus(status)}
        // />
      );
    }
  };

  useEffect(() => {
    if (!isReady) {
      fetchData();
    }

    if (txnHash) {
      // Refresh delegation
      if (Number(votingPower) > 0) {
        setRefetchDelegate({
          address: delegate.address,
          prevVotingPowerDelegatee: delegate.votingPower.total,
        });
      }
    }
  }, [isReady, fetchData, status, delegate, votingPower]);

  useEffect(() => {
    if (delegator && !accountAddress) {
      setAccountAddress(delegator.statement?.scw_address || address);
    }
  }, [delegator, address, accountAddress]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[318px]">
        {shouldHideAgoraBranding ? <LogoLoader /> : <AgoraLoaderSmall />}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full bg-neutral max-w-[28rem]">
      <div className="flex flex-col gap-6 justify-center min-h-[318px] w-full">
        {delegatee ? (
          <div className="flex flex-col gap-3 items-center py-3 w-full text-tertiary text-xs">
            <div className="flex flex-col text-xs border border-line rounded-lg justify-center items-center w-full py-8 px-2">
              <div className="flex flex-row items-center gap-1">
                Your total delegatable votes
              </div>
              <AdvancedDelegationDisplayAmount amount={votingPower} />
            </div>
            <div className="flex flex-col relative w-full">
              <div className="flex flex-row items-center gap-3 p-2 pb-4 pl-0 border-b border-line">
                <ENSAvatar ensName={delegateeEnsName} className="h-10 w-10" />
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-secondary">
                    Currently delegated to
                  </p>
                  <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                    <ENSName address={delegatee.delegatee} />
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center w-10 h-10 translate-x-1/2 -translate-y-1/2 bg-neutral border border-line rounded-full right-1/2 top-1/2">
                <ArrowDownIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-row items-center gap-3 p-2 pt-4 pl-0">
                <ENSAvatar ensName={delegateEnsName} className="h-10 w-10" />
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-secondary">
                    Delegating to
                  </p>
                  <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                    <ENSName address={delegate.address} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-xl font-bold text-left">
              Set <ENSName address={delegate.address} /> as your delegate
            </p>
            <div className="text-secondary">
              <ENSName address={delegate.address} /> will be able to vote with
              any token owned by your address
            </div>
            <div className="flex flex-col relative border border-line rounded-lg">
              <div className="flex flex-row items-center gap-3 p-2 border-b border-line">
                <ENSAvatar ensName={""} className="h-10 w-10" />
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-secondary">
                    Currently delegated to
                  </p>
                  <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                    <p>N/A</p>
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 flex items-center justify-center bg-neutral border border-line rounded-full absolute right-4 top-[50%] translate-y-[-50%]">
                <ArrowDownIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-row gap-3 items-center p-2">
                <ENSAvatar ensName={delegateEnsName} className="w-10 h-10" />

                <div className="flex flex-col">
                  <p className="text-xs font-medium text-secondary">
                    Delegating to
                  </p>
                  <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                    <ENSName address={delegate.address} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {renderActionButtons()}
      </div>
    </div>
  );
}
