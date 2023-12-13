"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { LoaderIcon, Lock } from "lucide-react";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { OptimismContracts } from "@/lib/contracts/contracts";

const secondsPerBlock = 2;

// TODO: Take init state values from the chain
export default function GovernorSettings() {
  const [votingPeriod, setVotingPeriod] = useState(7);
  const { config: setVotingPeriodConfig } = usePrepareContractWrite({
    address: OptimismContracts.governor.address as any,
    abi: OptimismContracts.governor.abi,
    functionName: "setVotingPeriod",
    args: [
      (BigInt(votingPeriod || 0) * 60n * 60n * 24n) / BigInt(secondsPerBlock),
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

  const [votingDelay, setVotingDelay] = useState(168);
  const { config: setVotingDelayConfig } = usePrepareContractWrite({
    address: OptimismContracts.governor.address as any,
    abi: OptimismContracts.governor.abi,
    functionName: "setVotingDelay",
    args: [
      (BigInt(votingDelay || 0) * 60n * 60n * 24n) / BigInt(secondsPerBlock),
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
  //   address: "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f",
  //   abi: GovernorAbi,
  //   functionName: "setManagerAddress",
  //   args: [
  //     (BigInt(managerAddress || 0) * 60n * 60n * 24n) / BigInt(secondsPerBlock)
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
        <h1>Governor settings</h1>
        <p>Set how all proposals work</p>
      </section>
      <div className="space-y-8 my-4">
        <div className="flex justify-between gap-4">
          <div className="flex-1">
            <Label>Voting period</Label>
            <div className="relative flex items-center">
              <Input
                value={votingPeriod}
                onChange={(e) => setVotingPeriod(parseInt(e.target.value))}
                disabled={isDisabledSetVotingPeriod}
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
                disabled={isDisabledSetVotingPeriod}
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
                disabled={isDisabledSetVotingDelay}
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
                disabled={isDisabledSetVotingDelay}
                onClick={() => {
                  writeSetVotingDelay?.();
                }}
              >
                Update
              </Button>
            </div>
          </div>
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
