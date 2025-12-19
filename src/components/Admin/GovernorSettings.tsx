"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import BlockScanUrls from "../shared/BlockScanUrl";
import {
  useReadContracts,
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useAccount,
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
  const { address } = useAccount();

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
    const hours = Number(valueInHours);
    if (isNaN(hours) || !secondsPerBlock) {
      return 0n;
    }
    return BigInt(Math.floor((hours * SECONDS_IN_HOUR) / secondsPerBlock));
  }

  const { data: votingPeriodConfig, isError: votingPeriodError } =
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
  const {
    isLoading: isLoadingSetVotingPeriodTransaction,
    status: periodTXStatus,
    error: periodTXError,
  } = useWaitForTransactionReceipt({
    hash: resultSetVotingPeriod,
  });
  const isDisabledSetVotingPeriod =
    isLoadingSetVotingPeriod || isLoadingSetVotingPeriodTransaction;

  const [votingDelay, setVotingDelay] = useState("");
  const { data: votingDelayConfig, isError: votingDelayError } =
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
  const {
    isLoading: isLoadingSetVotingDelayTransaction,
    status: delayTXStatus,
    error: delayTXerror,
  } = useWaitForTransactionReceipt({
    hash: resultSetVotingDelay,
  });
  const isDisabledSetVotingDelay =
    isLoadingSetVotingDelay || isLoadingSetVotingDelayTransaction;

  const isAdmin = address === adminAddress;

  useEffect(() => {
    if (periodTXStatus === "success" && resultSetVotingPeriod) {
      toast.success(
        <div className="flex flex-col items-center gap-2 p-1">
          <span className="text-sm font-semibold">Updated Successfully!</span>
          <BlockScanUrls hash1={resultSetVotingPeriod} />
        </div>
      );
    } else if (periodTXStatus === "error") {
      toast.error("Transaction failed.");
      console.error("Transaction error - period:", periodTXError);
    }
  }, [periodTXStatus, resultSetVotingPeriod, periodTXError]);

  useEffect(() => {
    if (delayTXStatus === "success" && resultSetVotingDelay) {
      toast.success(
        <div className="flex flex-col items-center gap-2 p-1">
          <span className="text-sm font-semibold">Updated Successfully!</span>
          <BlockScanUrls hash1={resultSetVotingDelay} />
        </div>
      );
    } else if (delayTXStatus === "error") {
      toast.error("Transaction failed.");
      console.error("Transaction error - delay:", delayTXerror);
    }
  }, [delayTXStatus, resultSetVotingDelay, delayTXerror]);

  return (
    <div className="gl_box bg-neutral">
      <section>
        <h1 className="font-extrabold text-2xl text-primary">
          Governor Settings
        </h1>
      </section>
      <div className="my-4">
        {isAdmin ? (
          <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:gap-4 flex-column">
            <GovernorUnlockedSetting
              name={"Voting Period"}
              value={votingPeriod}
              setValue={setVotingPeriod}
              disabled={isDisabledSetVotingPeriod}
              min={0}
              step={0.01}
              writeContract={writeSetVotingPeriod}
              setConfig={votingPeriodConfig}
              period={"hours"}
              isError={votingPeriodError}
            />
            <GovernorUnlockedSetting
              name={"Voting Delay"}
              value={votingDelay}
              setValue={setVotingDelay}
              disabled={isDisabledSetVotingDelay}
              min={0}
              step={0.01}
              writeContract={writeSetVotingDelay}
              setConfig={votingDelayConfig}
              period={"hours"}
              isError={votingDelayError}
            />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:gap-4">
            <GovernorLockedSetting
              name={"Voting Period"}
              value={votingPeriod}
              period={"hours"}
            />
            <GovernorLockedSetting
              name={"Voting Delay"}
              value={votingDelay}
              period={"hours"}
            />
          </div>
        )}

        <Separator className="my-8" />
        <GovernorLockedSetting
          name={"Manager Address"}
          value={manager}
          period={""}
        />
        {adminAddress && (
          <GovernorLockedSetting
            name={"Admin Address"}
            value={adminAddress}
            period={""}
          />
        )}
      </div>
    </div>
  );
}

function GovernorLockedSetting({
  name,
  value,
  period,
}: GovernLockSettingProps) {
  return (
    <div className="space-y-1 sm:space-y-0 text-sm sm:flex sm:justify-between sm:items-center sm:px-2 mb-4">
      <div className="flex items-center gap-2 mr-1">
        <p className="text-secondary">{name}</p>
        <Lock className="w-4 h-4 text-primary/30" />
      </div>
      <p className="text-secondary truncate font-bold">
        {value}
        <span className="text-secondary font-medium"> {period}</span>
      </p>
    </div>
  );
}

interface GovernLockSettingProps {
  name: string;
  value: string;
  period: string;
  setValue?: (value: any) => void;
  disabled?: boolean;
  min?: number;
  step?: number;
  writeContract?: any;
  setConfig?: any;
  isError?: boolean;
}

function GovernorUnlockedSetting(props: GovernLockSettingProps) {
  return (
    <div className="flex-1">
      <Label>{props.name}</Label>
      <div className="relative flex items-center">
        <Input
          min={props.min}
          value={props.value}
          onChange={(e) => props.setValue!(e.target.value)}
          disabled={/* isInitializing || */ props.disabled || props.isError}
          step={props.step}
          type="number"
        />
        <p className="absolute text-sm text-tertiary right-[96px]">
          {props.period}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="absolute right-[6px] rounded-sm"
          loading={props.disabled}
          disabled={
            /* isInitializing || */ props.disabled ||
            props.isError ||
            props.value === ""
          }
          onClick={() => {
            props.writeContract(props.setConfig!.request);
          }}
        >
          Update
        </Button>
      </div>
    </div>
  );
}
