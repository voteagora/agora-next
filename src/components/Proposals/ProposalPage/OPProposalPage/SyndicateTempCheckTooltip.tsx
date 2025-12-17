import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

interface Props {
  className?: string;
}

export default function SyndicateTempCheckTooltip({ className }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center">
            <InformationCircleIcon
              className={`h-4 w-4 cursor-pointer text-secondary hover:text-primary ${className || ""}`}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="text-xs space-y-2">
            <p>
              Most temp checks require 5% of tokens in existence; however, to
              replace parties as authorized through governance proposal
              (currently, Syndicate Labs) to make changes to the construction or
              function of the smart contracts comprising the Syndicate Network
              require higher percentages to ensure operational stability.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Nov 3, 2025 - Nov 2, 2026: 30% of tokens in existence</li>
              <li>Nov 3, 2026 - Nov 2, 2027: 20% of tokens in existence</li>
              <li>Nov 3, 2027 - Nov 2, 2028: 10% of tokens in existence</li>
              <li>Nov 3, 2028 onward: Reverts to standard 5%</li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
