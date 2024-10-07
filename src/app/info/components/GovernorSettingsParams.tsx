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
import { useContractRead } from "wagmi";
import { pluralize } from "@/lib/utils";
import { SECONDS_IN_HOUR } from "@/lib/constants";
import { blocksToSeconds } from "@/lib/blockTimes";

const GovernorSettingsParams = () => {
  const { contracts } = Tenant.current();

  const { data: votingDelay, isFetched: isDelayFetched } = useContractRead({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "votingDelay",
  });

  const { data: votingPeriod, isFetched: isPeriodFetched } = useContractRead({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "votingPeriod",
  });

  const secondsToHuman = (seconds: number) => {
    const hrs = Math.round(Number(seconds) / SECONDS_IN_HOUR);
    return hrs === 0 ? "Less than 1 hour" : pluralize("hour", hrs);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-base font-semibold text-left text-secondary bg-wash rounded-tl-xl">
            Parameter
          </TableHead>
          <TableHead className="text-base font-semibold text-secondary text-right bg-wash rounded-tr-xl">
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
            {isDelayFetched && votingDelay
              ? secondsToHuman(blocksToSeconds(Number(votingDelay)))
              : "Loading..."}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="text-base font-semibold text-left text-secondary rounded-bl-xl">
            Voting Period
          </TableCell>
          <TableCell className="text-base font-semibold text-right text-primary rounded-br-xl">
            {isPeriodFetched && votingPeriod
              ? secondsToHuman(blocksToSeconds(Number(votingPeriod)))
              : "Loading..."}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
export default GovernorSettingsParams;
