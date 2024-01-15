"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import {
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Separator } from "@/components/ui/separator";
import { OptimismContracts } from "@/lib/contracts/contracts";

const secondsPerBlock = 2;

const governorContract = {
  address: OptimismContracts.governor.address,
  abi: OptimismContracts.governor.abi,
  chainId: 10,
};

// TODO: Take init state values from the chain
export default function GovernorSettings() {
  const { data, isLoading: isInitializing } = useContractReads({
    contracts: [
      {
        ...governorContract,
        functionName: "votingPeriod",
      },
      {
        ...governorContract,
        functionName: "votingDelay",
      },
      {
        ...governorContract,
        functionName: "manager",
      },
    ],
  });

  const [initVotingPeriod, initVotingDelay, initManager] = data || [];

  useEffect(() => {
    if (data) {
      setVotingPeriod(
        (Number(initVotingPeriod!.result) * secondsPerBlock) / 3600
      );
      setVotingDelay(
        (Number(initVotingDelay!.result) * secondsPerBlock) / 3600
      );
      setManager(String(initManager!.result));
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const [manager, setManager] = useState("0x...");
  const [votingPeriod, setVotingPeriod] = useState<number>();
  const { config: setVotingPeriodConfig, isError: setVotingPeriodError } =
    usePrepareContractWrite({
      ...governorContract,
      functionName: "setVotingPeriod",
      args: [
        (BigInt(Math.floor(votingPeriod || 0)) * 3600n) /
          BigInt(secondsPerBlock),
      ],
    });
  const {
    data: resultSetVotingPeriod,
    write: writeSetVotingPeriod,
    isLoading: isLoadingSetVotingPeriod,
  } = useContractWrite(setVotingPeriodConfig);
  const { isLoading: isLoadingSetVotingPeriodTransaction } =
    useWaitForTransaction({
      hash: resultSetVotingPeriod?.hash,
    });
  const isDisabledSetVotingPeriod =
    isLoadingSetVotingPeriod || isLoadingSetVotingPeriodTransaction;

  const [votingDelay, setVotingDelay] = useState<number>();
  const { config: setVotingDelayConfig, isError: setVotingDelayError } =
    usePrepareContractWrite({
      ...governorContract,
      functionName: "setVotingDelay",
      args: [
        (BigInt(Math.floor(votingDelay || 0)) * 3600n) /
          BigInt(secondsPerBlock),
      ],
    });
  const {
    data: resultSetVotingDelay,
    write: writeSetVotingDelay,
    isLoading: isLoadingSetVotingDelay,
  } = useContractWrite(setVotingDelayConfig);
  const { isLoading: isLoadingSetVotingDelayTransaction } =
    useWaitForTransaction({
      hash: resultSetVotingDelay?.hash,
    });
  const isDisabledSetVotingDelay =
    isLoadingSetVotingDelay || isLoadingSetVotingDelayTransaction;

  // const [managerAddress, setManagerAddress] = useState(currentManager as string)
  // const { config: setManagerAddressConfig } = usePrepareContractWrite({
  //   ...governorContract,
  //   functionName: "setManagerAddress",
  //   args: [
  //     (BigInt(managerAddress || 0) * 3600n) / BigInt(secondsPerBlock)
  //   ]
  // })
  // const {
  //   data: resultSetManagerAddress,
  //   write: writeSetManagerAddress,
  //   isLoading: isLoadingSetManagerAddress,
  //   isError: isErrorSetManagerAddress
  // } = useContractWrite(setManagerAddressConfig)
  // const { isLoading: isLoadingSetManagerAddressTransaction } =
  //   useWaitForTransaction({
  //     hash: resultSetManagerAddress?.hash
  //   })
  // const isDisabledSetManagerAddress =
  //   isLoadingSetVotingDelay || isLoadingSetVotingDelayTransaction

  return (
    <div className="gl_box">
      <section>
        <h1 className="font-extrabold text-2xl">Governor settings</h1>
        <p>Set how all proposals work</p>
      </section>
      <div className="space-y-8 my-4">
        <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:gap-4">
          <div className="flex-1">
            <Label>Voting period</Label>
            <div className="relative flex items-center">
              <Input
                value={votingPeriod}
                onChange={(e) => setVotingPeriod(parseInt(e.target.value))}
                disabled={
                  /* isInitializing || */ isDisabledSetVotingPeriod ||
                  setVotingPeriodError
                }
                type="number"
              />
              <p className="absolute text-sm text-muted-foreground right-[96px]">
                Hours
              </p>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-[6px] rounded-sm bg-white"
                loading={isDisabledSetVotingPeriod}
                disabled={
                  /* isInitializing || */ isDisabledSetVotingPeriod ||
                  setVotingPeriodError
                }
                onClick={() => {
                  writeSetVotingPeriod?.();
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
                value={votingDelay}
                onChange={(e) => setVotingDelay(parseInt(e.target.value))}
                disabled={
                  /* isInitializing || */ isDisabledSetVotingDelay ||
                  setVotingDelayError
                }
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
                  setVotingDelayError
                }
                onClick={() => {
                  writeSetVotingDelay?.();
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
            <p className="text-gray-4f">Manager Address</p>
            <Lock className="w-4 h-4 text-gray-af" />
          </div>
          <p className="text-gray-4f truncate">{manager}</p>
        </div>
        {/* <div className={!isManager ? "opacity-70" : ""}>
          <Label>ManagerAddress</Label>
          <div className="relative flex items-center">
            <Input
              value={managerAddress}
              onChange={(e) => setManagerAddress(e.target.value)}
              disabled={!isManager}
            />
            {!isManager && (
              <Lock className="absolute text-sm text-muted-foreground right-[96px] w-3.5 h-3.5 cursor-not-allowed" />
            )}
            <Button
              className="absolute top-0 right-0"
              variant="outline"
              size='sm'
              disabled={!isManager}
            >
              Update
            </Button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
