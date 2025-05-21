import React, { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FormSectionWithTooltipProps {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  canEdit: boolean;
  tooltipContent?: string;
}

export const FormSectionWithTooltip: React.FC<FormSectionWithTooltipProps> = ({
  icon,
  title,
  description,
  children,
  canEdit,
  tooltipContent = "This content cannot be edited as it is pending approval from a Safe Wallet. You can cancel this submission any time prior to approvals.",
}) => {
  const formSection = (
    <div className="flex flex-col bg-neutral rounded-xl border border-line mb-4">
      <div className="self-stretch px-6 py-3.5 bg-brandPrimary/10 border-b border-line inline-flex justify-start items-center gap-1.5 rounded-tl-xl rounded-tr-xl">
        {icon}
        <div className="flex justify-start items-start gap-1 justify-center text-xs leading-none">
          <div className="font-semibold block md:hidden lg:block">{title}</div>
          <div className="font-medium">{description}</div>
        </div>
      </div>
      {children}
    </div>
  );

  if (canEdit) {
    return formSection;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-full text-left">
          {formSection}
        </TooltipTrigger>
        <TooltipContent className="text-primary text-sm max-w-[300px]">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
