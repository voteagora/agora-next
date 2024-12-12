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

// TODO: Take init state values from the chain
export default function GovernorSettings() {
  const secondsPerBlock = getSecondsPerBlock();
  const { contracts } = Tenant.current();

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
          Governor settings
        </h1>
        <p>Set how all proposals work</p>
      </section>
      <div className="space-y-8 my-4">
        <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:gap-4">
          <div className="flex-1">
            <Label>Voting period</Label>
            <div className="relative flex items-center">
              <Input
                min={0}
                value={votingPeriod}
                onChange={(e) => setVotingPeriod(e.target.value)}
                disabled={/* isInitializing || */ isDisabledSetVotingPeriod}
                step={0.01}
                type="number"
              />
              <p className="absolute text-sm text-muted-foreground right-[96px]">
                Hours
              </p>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-[6px] rounded-sm bg-neutral"
                loading={isDisabledSetVotingPeriod}
                disabled={
                  /* isInitializing || */ isDisabledSetVotingPeriod ||
                  setVotingPeriodError ||
                  votingPeriod === ""
                }
                onClick={() => {
                  writeSetVotingPeriod(setVotingPeriodConfig!.request);
                }}
              >
                Update
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <Label>Voting delay</Label>
            <div className="relative flex items-center">
              <Input
                min={0}
                value={votingDelay}
                onChange={(e) => setVotingDelay(e.target.value)}
                disabled={/* isInitializing || */ isDisabledSetVotingDelay}
                step={0.01}
                type="number"
              />
              <p className="absolute text-sm text-muted-foreground right-[96px]">
                Hours
              </p>
              <Button
                className="absolute right-[6px] rounded-sm"
                variant="outline"
                size="sm"
                loading={isDisabledSetVotingDelay}
                disabled={
                  /* isInitializing || */ isDisabledSetVotingDelay ||
                  setVotingDelayError ||
                  votingDelay === ""
                }
                onClick={() => {
                  writeSetVotingDelay(setVotingDelayConfig!.request);
                }}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="space-y-1 sm:space-y-0 text-sm sm:flex sm:justify-between sm:items-center sm:px-2">
          <div className="flex items-center gap-2">
            <p className="text-secondary">Manager Address</p>
            <Lock className="w-4 h-4 text-primary/30" />
          </div>
          <p className="text-secondary truncate">{manager}</p>
        </div>
      </div>
    </div>
  );
}
