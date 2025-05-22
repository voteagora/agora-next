import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";

export const SafeTxnTooltip = ({
  tooltipText = "This action is awaiting Safe signature approvals. Once approved, this action can be executed.",
  children,
  className,
}: {
  tooltipText?: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={cn("flex flex-row space-x-1 items-center", className)}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent className="text-primary text-sm max-w-[320px]">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
