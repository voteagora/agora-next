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
  Tooltip,
} from "recharts";

import avatar0 from "@/components/shared/avatars/avatar0.svg";
import avatar1 from "@/components/shared/avatars/avatar1.svg";
import avatar2 from "@/components/shared/avatars/avatar2.svg";
import avatar3 from "@/components/shared/avatars/avatar3.svg";
import avatar4 from "@/components/shared/avatars/avatar4.svg";
import avatar5 from "@/components/shared/avatars/avatar5.svg";
import avatar6 from "@/components/shared/avatars/avatar6.svg";
// import avatar7 from "@/components/shared/avatars/avatar7.png";
import avatar7 from "../../../shared/avatars/avatar7.svg";
import Link from "next/link";
import chartData1 from "./votes.json";
import { ta } from "date-fns/locale";

const avatars = [
  avatar0,
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
];

// const data = Array.from({ length: 10 }, (_, index) => ({
//   name: `Page ${index + 1}`,
//   uv: Math.floor(Math.random() * 120),
//   pv: Math.floor(Math.random() * 120),
//   amt: Math.floor(Math.random() * 120),
// })).sort((a, b) => a.uv - b.uv);

const chartData = chartData1.sort(
  (a, b) =>
    new Date(a.block.timestamp).getTime() -
    new Date(b.block.timestamp).getTime()
);

const processData = () => {
  // Organize data into separate arrays based on support type
  const forData = chartData.filter((item) => item.support === "FOR");
  const againstData = chartData.filter((item) => item.support === "AGAINST");
  const abstainData = chartData.filter((item) => item.support === "ABSTAIN");

  // Function to calculate cumulative sum for each array
  const calculateCumulativeSum = (dataArray: any) => {
    let sum = 0;
    return dataArray.map((item: any) => {
      sum += parseInt(item.weight);
      return { ...item, cumulativeWeight: sum };
    });
  };

  // Calculate cumulative sum for each support type
  const processedForData = calculateCumulativeSum([
    { ...chartData[0], weight: 0 },
    ...forData,
  ]);
  const processedAgainstData = calculateCumulativeSum([
    { ...chartData[0], weight: 0 },
    ...againstData,
  ]);
  const processedAbstainData = calculateCumulativeSum([
    { ...chartData[0], weight: 0 },
    ...againstData,
  ]);

  return {
    processedForData,
    processedAgainstData,
    processedAbstainData,
  };
};

const CutomizedChartDots = (props: any) => {
  const { cx, cy, stroke, payload, value } = props;

  const randomIndex = Math.floor(Math.random() * avatars.length);
  const SelectedAvatar = avatars[randomIndex];

  console.log(payload, "payload");

  const voterpicture = payload.voter.picture;

  if (payload.cumulativeWeight !== 0) {
    return (
      <svg height="16" width="16" x={cx - 12} y={cy - 12}>
        <Link href="#">
          <foreignObject height="16px" width="16px">
            <Image
              width={16}
              height={16}
              className="rounded-full"
              alt="User profile image"
              src={voterpicture ?? SelectedAvatar}
            />
          </foreignObject>
        </Link>
      </svg>
    );
  }

  return null;
};

const CustomLabel = ({
  x,
  y,
  ...res
}: {
  x?: string | number;
  y?: string | number;
}) => (
  <text
    x={715}
    y={55}
    fontSize={12}
    fill="#718096"
    className="text-sm"
    textAnchor="end"
    {...res}
  >
    {/* Custom label styling */}
    <tspan dy="0.71em">Quorum needed</tspan>
  </text>
);

export default function VotingTimelineChart() {
  const { processedForData, processedAgainstData, processedAbstainData } =
    processData();
  return (
    <>
      <LineChart
        height={500}
        width={750}
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid color="red" vertical={false} />
        <XAxis
          dataKey="block.timestamp"
          axisLine={false}
          tickLine={false}
          domain={["auto", "auto"]}
          fontSize={10}
          fill="#718096"
          tickFormatter={(timeStr) => {
            const date = new Date(timeStr);
            const options: Intl.DateTimeFormatOptions = {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            };
            return date.toLocaleDateString("en-US", options);
          }}
        />

        <YAxis
          tickLine={false}
          fontSize="12px"
          fill="#718096"
          axisLine={false}
        />
        <ReferenceLine
          fill="#718096"
          y={109}
          strokeWidth={1}
          strokeDasharray="3 3"
          stroke="#718096"
          label={<CustomLabel />}
        />
        <Tooltip />
        <Line
          data={processedAgainstData}
          dataKey="cumulativeWeight"
          type="linear"
          stroke="#8884d8"
          strokeWidth={2}
          dot={<CutomizedChartDots />}
        />
        <Line
          data={processedForData}
          type="linear"
          dataKey="cumulativeWeight"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={<CutomizedChartDots />}
        />
        <Line
          type="linear"
          stroke="#880808"
          strokeWidth={2}
          dataKey="cumulativeWeight"
          data={processedAbstainData}
          dot={<CutomizedChartDots />}
        />
      </LineChart>
    </>
  );
}
