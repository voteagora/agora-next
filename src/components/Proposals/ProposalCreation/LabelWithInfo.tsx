"use client";

import InfoPop from "@/components/shared/InfoPop";

export default function LabelWithInfo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-tertiary font-bold mb-1 text-xs flex items-center">
      {label} <InfoPop>{children}</InfoPop>
    </label>
  );
}
