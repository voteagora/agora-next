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
import { formatDuration, intervalToDuration } from "date-fns";

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
    if (seconds < SECONDS_IN_HOUR) {
      return "Less than 1 hour";
    }

    const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

    // Format days, hours, and minutes
    const parts = [];
    if (duration.days && duration.days > 0) {
      parts.push(pluralize("day", duration.days));
    }

    if (duration.hours && duration.hours > 0) {
      parts.push(pluralize("hour", duration.hours));
    }

    // Include minutes if there are no days and we have minutes
    if (!duration.days && duration.minutes && duration.minutes > 0) {
      parts.push(pluralize("minute", duration.minutes));
    }

    // If we have only days and it's exactly a multiple of 24 hours, show just days
    if (
      parts.length === 1 &&
      duration.days &&
      duration.days > 0 &&
      !duration.hours &&
      !duration.minutes
    ) {
      return parts[0];
    }

    return parts.join(", ");
  };

  if (namespace === TENANT_NAMESPACES.UNISWAP) {
    return null;
  }

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
                ? secondsToHuman(Number(timeLockDelay))
                : "Loading..."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
export default GovernorSettingsParams;
