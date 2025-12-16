import React from "react";
import { InfoOutlineIcon } from "@/icons/InfoOutlineIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Tenant from "@/lib/tenant/tenant";

interface VotingPowerInfoTooltipProps {
  className?: string;
  iconClassName?: string;
}

export function VotingPowerInfoTooltip({
  className,
  iconClassName = "w-4 h-4",
}: VotingPowerInfoTooltipProps) {
  const { ui } = Tenant.current();
  const vpTooltip = ui.toggle("voting-power-info-tooltip");

  if (!vpTooltip?.enabled || !(vpTooltip as any)?.config?.text) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center ml-1 ${className || ""}`}>
            <InfoOutlineIcon className={iconClassName} fill="#737373" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[320px] p-4 rounded-xl bg-black text-neutral text-sm leading-snug shadow-md whitespace-normal break-words">
          {(vpTooltip as any).config.text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
