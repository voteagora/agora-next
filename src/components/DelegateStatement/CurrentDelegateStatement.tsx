"use client";

import { useAccount } from "wagmi";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";

export default function CurrentDelegateStatement() {
  const { isConnected, isConnecting } = useAccount();

  if (!isConnected && !isConnecting) {
    return <ResourceNotFound message="Oops! Nothing's here" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-gray-600">Form loading...</div>
    </div>
  );
}
