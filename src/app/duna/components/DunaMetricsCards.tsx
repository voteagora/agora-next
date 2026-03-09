import React from "react";

type TrendDirection = "up" | "down";

type MetricCardProps = {
  title: string;
  value: string;
  trend: string;
  trendDirection: TrendDirection;
};

function TrendUpIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M2.25 13.5L7.5 8.25L10.5 11.25L15.75 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.25 6H15.75V10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendDownIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M2.25 6L7.5 11.25L10.5 8.25L15.75 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.25 13.5H15.75V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricCard({ title, value, trend, trendDirection }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-3 p-6 rounded-[20px] bg-wash border border-line flex-1 min-w-0">
      <p className="text-sm font-semibold text-primary uppercase tracking-wide">
        {title}
      </p>
      <p
        className="text-[clamp(2rem,3.5vw,3.375rem)] leading-tight text-primary"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        {value}
      </p>
      <div className="inline-flex items-center gap-2 px-[10px] py-1 rounded-full border border-line self-start">
        {trendDirection === "up" ? <TrendUpIcon /> : <TrendDownIcon />}
        <span className="text-sm font-medium text-primary">{trend}</span>
      </div>
    </div>
  );
}

export default function DunaMetricsCards() {
  const metrics: MetricCardProps[] = [
    {
      title: "Total Assets",
      value: "$70,800,012",
      trend: "-12.4% vs Q2",
      trendDirection: "down",
    },
    {
      title: "Net Loss",
      value: "$1,980,000",
      trend: "+10.2% vs Q2",
      trendDirection: "up",
    },
    {
      title: "Total Operating Expenses",
      value: "$174,700",
      trend: "+10.2% vs Q2",
      trendDirection: "up",
    },
    {
      title: "Cash & Cash Equivalents",
      value: "$10,600,000",
      trend: "+10.2% vs Q2",
      trendDirection: "up",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
