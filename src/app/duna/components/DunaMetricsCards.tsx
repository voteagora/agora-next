"use client";

import React from "react";
import { useFinancialMetrics } from "@/hooks/useFinancialMetrics";
import { DaoSlug } from "@prisma/client";

type TrendDirection = "up" | "down";

function formatNumber(num: string): string {
  const value = parseInt(num, 10);

  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value.toLocaleString()}`;
  }
}

type MetricCardProps = {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: TrendDirection;
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
        {formatNumber(value)}
      </p>
      {trend && trendDirection && (
        <div className="inline-flex items-center gap-2 px-[10px] py-1 rounded-full border border-line self-start">
          {trendDirection === "up" ? <TrendUpIcon /> : <TrendDownIcon />}
          <span className="text-sm font-medium text-primary">{trend}</span>
        </div>
      )}
    </div>
  );
}

function calculateTrend(
  current: number | null | undefined,
  previous: number | null | undefined
): { trend: string; trendDirection: TrendDirection } {
  if (!current || !previous) {
    return { trend: "N/A", trendDirection: "up" };
  }

  const percentChange = ((current - previous) / previous) * 100;
  const direction: TrendDirection = percentChange >= 0 ? "up" : "down";
  const sign = percentChange >= 0 ? "+" : "";

  return {
    trend: `${sign}${percentChange.toFixed(1)}% vs previous`,
    trendDirection: direction,
  };
}

export default function DunaMetricsCards() {
  const { data, isLoading, error } = useFinancialMetrics(DaoSlug.SYNDICATE);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-3 p-6 rounded-[20px] bg-wash border border-line flex-1 min-w-0 animate-pulse"
          >
            <div className="h-4 bg-line rounded w-1/2" />
            <div className="h-12 bg-line rounded w-3/4" />
            <div className="h-6 bg-line rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data?.metrics || data.metrics.length === 0) {
    return (
      <div className="p-6 rounded-[20px] bg-wash border border-line text-center">
        <p className="text-secondary">No financial metrics available</p>
      </div>
    );
  }

  const [latest, previous] = data.metrics;
  const latestData = latest.data;
  const previousData = previous?.data;

  const netProfitOrLoss = latestData.NET_PROFIT
    ? { title: "Net Profit", value: latestData.NET_PROFIT }
    : latestData.NET_LOSS
      ? { title: "Net Loss", value: latestData.NET_LOSS }
      : null;

  const previousNetProfitOrLoss =
    previousData?.NET_PROFIT || previousData?.NET_LOSS;

  const metrics: MetricCardProps[] = [
    {
      title: "Total Assets",
      value: String(latestData.TOTAL_ASSETS || 0),
      ...(previous
        ? calculateTrend(latestData.TOTAL_ASSETS, previousData?.TOTAL_ASSETS)
        : {}),
    },
    ...(netProfitOrLoss
      ? [
          {
            title: netProfitOrLoss.title,
            value: String(netProfitOrLoss.value),
            ...(previous
              ? calculateTrend(netProfitOrLoss.value, previousNetProfitOrLoss)
              : {}),
          },
        ]
      : []),
    {
      title: "Total Operating Expenses",
      value: String(latestData.TOTAL_OPERATING_EXPENSES || 0),
      ...(previous
        ? calculateTrend(
            latestData.TOTAL_OPERATING_EXPENSES,
            previousData?.TOTAL_OPERATING_EXPENSES
          )
        : {}),
    },
    {
      title: "Cash & Cash Equivalents",
      value: String(latestData.CASH_AND_CASH_EQUIVALENTS || 0),
      ...(previous
        ? calculateTrend(
            latestData.CASH_AND_CASH_EQUIVALENTS,
            previousData?.CASH_AND_CASH_EQUIVALENTS
          )
        : {}),
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
