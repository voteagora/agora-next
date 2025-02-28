"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Tenant from "@/lib/tenant/tenant";
import { useReadContract } from "wagmi";
import { cn, pluralize } from "@/lib/utils";
import { SECONDS_IN_HOUR, TENANT_NAMESPACES } from "@/lib/constants";
import { blocksToSeconds } from "@/lib/blockTimes";

const GovernorSettingsParams = () => {
  const { contracts, namespace } = Tenant.current();

  const { data: votingDelay, isFetched: isDelayFetched } = useReadContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "votingDelay",
    chainId: contracts.governor.chain.id,
  });

  const { data: votingPeriod, isFetched: isPeriodFetched } = useReadContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "votingPeriod",
    chainId: contracts.governor.chain.id,
  });

  const { data: timeLockDelay, isFetched: isTimeLockDelayFetched } =
    useReadContract({
      address: contracts.timelock?.address as `0x${string}`,
      abi: contracts.timelock?.abi,
      functionName:
        namespace === TENANT_NAMESPACES.UNISWAP ? "delay" : "getMinDelay",
      chainId: contracts.timelock?.chain.id,
    });

  const secondsToHuman = (seconds: number) => {
    const hrs = Math.round(Number(seconds) / SECONDS_IN_HOUR);
    return hrs === 0 ? "Less than 1 hour" : pluralize("hour", hrs);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-base font-semibold text-left text-secondary bg-wash rounded-tl-lg">
            Parameter
          </TableHead>
          <TableHead className="text-base font-semibold text-secondary text-right bg-wash rounded-tr-lg">
            Value
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="text-base font-semibold text-left text-secondary">
            Voting Delay
          </TableCell>
          <TableCell className="text-base font-semibold text-right text-primary">
            {isDelayFetched && votingDelay !== undefined
              ? secondsToHuman(blocksToSeconds(Number(votingDelay)))
              : "Loading..."}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            className={cn(
              "text-base font-semibold text-left text-secondary",
              !contracts.timelock && "rounded-bl-xl"
            )}
          >
            Voting Period
          </TableCell>
          <TableCell
            className={cn(
              "text-base font-semibold text-right text-primary",
              !contracts.timelock && "rounded-br-xl"
            )}
          >
            {isPeriodFetched && votingPeriod !== undefined
              ? secondsToHuman(blocksToSeconds(Number(votingPeriod)))
              : "Loading..."}
          </TableCell>
        </TableRow>
        {contracts.timelock && (
          <TableRow>
            <TableCell className="text-base font-semibold text-left text-secondary rounded-bl-xl">
              Timelock Delay
            </TableCell>
            <TableCell className="text-base font-semibold text-right text-primary rounded-br-xl">
              {isTimeLockDelayFetched && timeLockDelay !== undefined
                ? secondsToHuman(blocksToSeconds(Number(timeLockDelay)))
                : "Loading..."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
export default GovernorSettingsParams;
