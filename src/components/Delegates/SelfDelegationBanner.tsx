"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useModal } from "connectkit";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import {
  fetchDirectDelegatee,
  fetchBalanceForDirectDelegation,
} from "@/app/delegates/actions";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { formatNumber } from "@/lib/tokenUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DelegationStatus =
  | "not-logged-in"
  | "not-delegated"
  | "delegated-to-self"
  | "loading";

export function SelfDelegationBanner() {
  const { address, isConnected } = useAccount();
  const { setOpen } = useModal();
  const openDialog = useOpenDialog();
  const { namespace } = Tenant.current();

  const [status, setStatus] = useState<DelegationStatus>("loading");
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkDelegationStatus() {
      if (!isConnected || !address) {
        setStatus("not-logged-in");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch token balance and delegation info in parallel
        const [balance, delegatee] = await Promise.all([
          fetchBalanceForDirectDelegation(address),
          fetchDirectDelegatee(address),
        ]);

        setTokenBalance(balance.toString());

        // Check if delegated to self
        const isDelegatedToSelf =
          delegatee?.delegatee?.toLowerCase() === address.toLowerCase();

        if (isDelegatedToSelf) {
          setStatus("delegated-to-self");
        } else {
          setStatus("not-delegated");
        }
      } catch (error) {
        console.error("Error checking delegation status:", error);
        setStatus("not-delegated");
      } finally {
        setIsLoading(false);
      }
    }

    checkDelegationStatus();
  }, [address, isConnected]);

  const handleSelfDelegate = () => {
    if (!address) {
      setOpen(true);
      return;
    }

    // Create a delegate object representing self
    const selfDelegate = {
      address: address,
      votingPower: {
        total: tokenBalance,
      },
    };

    // Only use FULL delegation model for Syndicate
    openDialog({
      type: "DELEGATE",
      params: {
        delegate: selfDelegate as any,
        fetchDirectDelegatee,
        isDelegationEncouragement: true,
      },
    });
  };

  // Only show for Syndicate namespace
  if (namespace !== TENANT_NAMESPACES.SYNDICATE) {
    return null;
  }

  if (isLoading || status === "loading") {
    return null;
  }

  if (tokenBalance === "0") {
    return null;
  }

  if (status === "delegated-to-self") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-neutral rounded-lg p-4 mb-6 flex items-center gap-3">
              <Info className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-500">
                You have delegated your {formatNumber(tokenBalance)} tokens
                already! You can use them to vote in the next proposal!
              </p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="text-xs space-y-2">
              <p>
                Self-delegating activates your voting power so you can vote
                directly in onchain proposals.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Onchain action: Call delegate({address}).</li>
                <li>
                  After this one-time step (per address, per chain), your votes
                  will track your token balance automatically. No need to repeat
                  unless you later delegate to someone else.
                </li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getBannerText = () => {
    if (status === "not-logged-in") {
      return "Vote any syndicate tokens you hold, by delegating them to yourself!";
    }
    return `You hold ${formatNumber(tokenBalance)} tokens, delegate them to yourself to vote with them in the next proposal!`;
  };

  const getTooltipContent = () => {
    if (status === "not-logged-in") {
      return (
        <div className="text-xs space-y-2">
          <p>
            Sign-in to delegate your tokens. This is a one time on-chain action.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Your votes will track your token balance automatically. No need to
              repeat unless you later delegate to another address.
            </li>
          </ul>
        </div>
      );
    }
    return (
      <div className="text-xs space-y-2">
        <p>
          Self-delegating activates your voting power so you can vote directly
          in onchain proposals.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Onchain action: Call delegate({address}).</li>
          <li>
            After this one-time step (per address, per chain), your votes will
            track your token balance automatically. No need to repeat unless you
            later delegate to someone else.
          </li>
        </ul>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="bg-neutral border border-neutral rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-500">{getBannerText()}</p>
              </div>
              <Button
                onClick={handleSelfDelegate}
                size="sm"
                className="flex-shrink-0"
              >
                Self-Delegate
              </Button>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
