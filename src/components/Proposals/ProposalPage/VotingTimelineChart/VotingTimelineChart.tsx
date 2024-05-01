"use client";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { icons } from "@/icons/icons";

import { Proposal } from "@/app/api/common/proposals/proposal";
import proposalVotes from "./votes.json";

const sortedChartData = proposalVotes.sort(
  (a, b) =>
    new Date(a.block.timestamp).getTime() -
    new Date(b.block.timestamp).getTime()
);

const chartData = () => {
  let forCount = 0;
  let abstain = 0;
  let against = 0;

  return sortedChartData.map((voter) => {
    forCount =
      voter.support === "FOR"
        ? forCount + parseInt(voter.weight)
        : forCount + 0;
    abstain =
      voter.support === "ABSTAIN"
        ? abstain + parseInt(voter.weight)
        : abstain + 0;
    against =
      voter.support === "AGAINST"
        ? against + parseInt(voter.weight)
        : against + 0;

    return {
      ...voter,
      for: forCount,
      abstain,
      against,
    };
  });
};

const tickFormatter = (timeStr: string, index: number) => {
  const date = new Date(timeStr);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  // Get hours and minutes
  let hours = date.getHours();
  let minutes = date.getMinutes();

  // Convert hours to 12-hour format
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle midnight (0 hours)

  minutes = minutes < 10 ? parseInt("0" + minutes) : minutes;
  const formattedDate = month + "/" + day + " " + hours + ":" + minutes + ampm;

  const metaText = index === 0 ? "(vote begins)" : "(vote end)";

  return `${formattedDate} ${metaText}`;
};

const customizedTick = (props: any) => {
  const { index, x, y, fill, payload, tickFormatter, className } = props;

  return (
    <g transform={`translate(${index === 0 ? x : x + 20},${y})`}>
      <text x={0} y={0} dy={10} fill="#AFAFAF" className={className}>
        <tspan textAnchor={index === 0 ? "middle" : "middle"} x="0">
          {tickFormatter(payload.value, index)}
        </tspan>
      </text>
    </g>
  );
};

export default function VotingTimelineChart({
  proposal,
}: {
  proposal: Proposal;
}) {
  return (
    <div className="border border-gray-300 rounded-lg p-4 pb-0 w-full font-inter ">
      <p className=" flex items-center gap-x-1.5 text-xs font-semibold ml-1 mb-2">
        Proposal Voting timeline{" "}
        <Image src={icons.chevronSelectorVertical} alt="chevronIcon" />
      </p>
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={chartData()}>
          <CartesianGrid vertical={false} strokeDasharray={"3 3"} />
          <XAxis
            dataKey="block.timestamp"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            ticks={[
              chartData()[0].block.timestamp,
              chartData()[chartData().length - 1].block.timestamp,
            ]}
            tickFormatter={tickFormatter}
            tick={customizedTick}
            className="text-xs font-inter font-semibold text-gray-af"
            fill={"#AFAFAF"}
          />

          <YAxis
            className="text-xs font-inter font-semibold fill:text-gray-af fill"
            tick={{
              fill: "#AFAFAF",
            }}
            tickLine={false}
            axisLine={false}
            tickCount={7}
            interval={0}
            width={20}
            tickMargin={0}
          />
          <ReferenceLine
            y={80}
            strokeWidth={1}
            strokeDasharray="3 3"
            stroke="#4F4F4F"
            label={{
              position: "insideBottomRight",
              value: "QUORUM",
              className: "text-xs font-inter font-semibold",
              fill: "#4F4F4F",
            }}
          />
          <Line
            dataKey="against"
            type="step"
            stroke="#C52F00"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="step"
            dataKey="for"
            stroke="#00992B"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="step"
            stroke="#8C8C8C"
            strokeWidth={2}
            dataKey="abstain"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
