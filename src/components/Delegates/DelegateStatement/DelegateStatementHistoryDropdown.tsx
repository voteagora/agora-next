import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { HistoryIcon } from "@/icons/History";
import { DelegateStatement as DelegateStatementType } from "@/app/api/common/delegates/delegate";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface DelegateStatementHistoryDropdownProps {
  delegateStatements: DelegateStatementType[];
  selectedStatementUpdatedAt: Date;
  onStatementSelect: (statement: DelegateStatementType) => void;
}

const getChangeDescription = (
  statement: DelegateStatementType,
  index: number,
  statements: DelegateStatementType[]
): string => {
  if (index === statements.length - 1 || !statements[index + 1]) {
    return "Statement Added";
  }

  const prevStatement = statements[index + 1];

  const currentPayload = statement.payload as any;
  const prevPayload = prevStatement.payload as any;

  const currentStatementText = currentPayload.delegateStatement;
  const prevStatementText = prevPayload.delegateStatement;
  if (currentStatementText !== prevStatementText) {
    return "Statement modified";
  }

  const currentIssues = JSON.stringify(currentPayload.topIssues || []);
  const prevIssues = JSON.stringify(prevPayload.topIssues || []);
  if (currentIssues !== prevIssues) {
    return "Top issues modified";
  }

  const currentStakeholders = JSON.stringify(
    currentPayload.topStakeholders || []
  );
  const prevStakeholders = JSON.stringify(prevPayload.topStakeholders || []);
  if (currentStakeholders !== prevStakeholders) {
    return "Top stakeholders modified";
  }

  if (
    currentPayload.twitter !== prevPayload.twitter ||
    currentPayload.warpcast !== prevPayload.warpcast ||
    currentPayload.discord !== prevPayload.discord ||
    currentPayload.email !== prevPayload.email
  ) {
    return "Social info modified";
  }

  return "Statement modified";
};

export const DelegateStatementHistoryDropdown = ({
  delegateStatements,
  selectedStatementUpdatedAt,
  onStatementSelect,
}: DelegateStatementHistoryDropdownProps) => {
  const [open, setOpen] = useState(false);

  // Format date as Month DD, YYYY
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time as @H:MMam/pm
  const formatTime = (date: Date): string => {
    return (
      "@" +
      date
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase()
    );
  };

  const onSelect = useCallback(
    (statement: DelegateStatementType) => {
      onStatementSelect(statement);
      setOpen(false);
    },
    [onStatementSelect]
  );

  if (delegateStatements.length <= 1) {
    return null;
  }

  return (
    <div className="absolute right-0 top-0">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="md:w-auto bg-wash py-[10px] ">
            <HistoryIcon className="mr-2 h-4 w-4 stroke-primary" />
            <span>History</span>
            <ChevronDown className="ml-6 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="max-w-[280px] py-4 pl-4 bg-neutral rounded-lg border border-line"
        >
          <div className="pl-2 text-primary font-semibold mb-4">
            Version history
          </div>

          <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto w-full">
            {delegateStatements.map((statement, index) => (
              <div key={statement.signature || index}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(statement);
                  }}
                  className={cn(
                    "self-stretch cursor-pointer hover:bg-brandPrimary/10 rounded px-2 py-1 mr-4",
                    selectedStatementUpdatedAt === statement.updatedAt
                      ? "bg-brandPrimary/10"
                      : ""
                  )}
                >
                  <div className="inline-flex flex-col justify-start items-start">
                    <div className="text-primary text-base font-medium leading-normal">
                      {statement.updated_at_ts
                        ? `${formatDate(new Date(statement.updated_at_ts))}, ${formatTime(new Date(statement.updated_at_ts))}`
                        : `Version ${index + 1}`}
                    </div>
                    <div className="text-secondary text-xs font-medium leading-none">
                      {getChangeDescription(
                        statement,
                        index,
                        delegateStatements
                      )}
                    </div>
                  </div>
                </div>
                {index === 0 && delegateStatements.length > 1 && (
                  <div className="h-0 border-t border-line w-[calc(100%-1rem)] mt-4" />
                )}
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
