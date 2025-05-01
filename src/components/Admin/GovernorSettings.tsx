"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import {
  useReadContracts,
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Separator } from "@/components/ui/separator";
import Tenant from "@/lib/tenant/tenant";
import { getSecondsPerBlock } from "@/lib/blockTimes";
import { SECONDS_IN_HOUR } from "@/lib/constants";
import { useGovernorAdmin } from "@/hooks/useGovernorAdmin";

// TODO: Take init state values from the chain
export default function GovernorSettings() {
  const { contracts, ui } = Tenant.current();
  const chainIdToUse = ui.toggle("use-l1-block-number")?.enabled
    ? contracts.chainForTime?.id
    : contracts.token.chain.id;

  const secondsPerBlock = getSecondsPerBlock(chainIdToUse);
  const { data: adminAddress } = useGovernorAdmin({ enabled: true });

  const govContract = {
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    chainId: contracts.governor.chain.id,
  };

  const { data, isLoading: isInitializing } = useReadContracts({
    contracts: [
      {
        ...govContract,
        functionName: "votingPeriod",
      },
      {
        ...govContract,
        functionName: "votingDelay",
      },
      {
        ...govContract,
        functionName: "manager",
      },
    ],
  });

  const [initVotingPeriod, initVotingDelay, initManager] = data || [];

  useEffect(() => {
    if (data) {
      setVotingPeriod(
        (
          (Number(initVotingPeriod!.result) * secondsPerBlock) /
          SECONDS_IN_HOUR
        ).toString()
      );
      setVotingDelay(
        (
          (Number(initVotingDelay!.result) * secondsPerBlock) /
          SECONDS_IN_HOUR
        ).toString()
      );
      setManager(String(initManager!.result));
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const [manager, setManager] = useState("0x...");
  const [votingPeriod, setVotingPeriod] = useState("");

  function convertToBlocks(valueInHours: string) {
    return BigInt(
      Math.floor((Number(valueInHours) * SECONDS_IN_HOUR) / secondsPerBlock)
    );
  }

  const { data: setVotingPeriodConfig, isError: setVotingPeriodError } =
    useSimulateContract({
      ...govContract,
      functionName: "setVotingPeriod",
      args: [votingPeriod === "" ? 0n : convertToBlocks(votingPeriod)],
    });

  const {
    data: resultSetVotingPeriod,
    writeContract: writeSetVotingPeriod,
    isPending: isLoadingSetVotingPeriod,
  } = useWriteContract();
  const { isLoading: isLoadingSetVotingPeriodTransaction } =
    useWaitForTransactionReceipt({
      hash: resultSetVotingPeriod,
    });
  const isDisabledSetVotingPeriod =
    isLoadingSetVotingPeriod || isLoadingSetVotingPeriodTransaction;

  const [votingDelay, setVotingDelay] = useState("");
  const { data: setVotingDelayConfig, isError: setVotingDelayError } =
    useSimulateContract({
      ...govContract,
      functionName: "setVotingDelay",
      args: [votingDelay === "" ? 0n : convertToBlocks(votingDelay)],
    });
  const {
    data: resultSetVotingDelay,
    writeContract: writeSetVotingDelay,
    isPending: isLoadingSetVotingDelay,
  } = useWriteContract();
  const { isLoading: isLoadingSetVotingDelayTransaction } =
    useWaitForTransactionReceipt({
      hash: resultSetVotingDelay,
    });
  const isDisabledSetVotingDelay =
    isLoadingSetVotingDelay || isLoadingSetVotingDelayTransaction;

  return (
    <div className="gl_box bg-neutral">
      <section>
        <h1 className="font-extrabold text-2xl text-primary">
          Governor Settings
        </h1>
      </section>
      <div className="my-4">
        <GovernorLockedSetting name={"Voting Period"} value={votingPeriod} />
        <GovernorLockedSetting name={"Voting Delay"} value={votingDelay} />
        <Separator className="my-8" />
        <GovernorLockedSetting name={"Manager Address"} value={manager} />
        {adminAddress && (
          <GovernorLockedSetting name={"Admin Address"} value={adminAddress} />
        )}
      </div>
    </div>
  );
}

function GovernorLockedSetting({
  name,
  value,
}: {
  name: string;
  value: string;
}) {
  return (
    <div className="space-y-1 sm:space-y-0 text-sm sm:flex sm:justify-between sm:items-center sm:px-2 mb-4">
      <div className="flex items-center gap-2">
        <p className="text-secondary">{name}</p>
        <Lock className="w-4 h-4 text-primary/30" />
      </div>
      <p className="text-secondary truncate">{value}</p>
    </div>
  );
}
