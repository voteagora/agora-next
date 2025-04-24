import { useContractAbi } from "@/hooks/useContractAbi";
import { ScopeData } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface ScopeDetailsProps {
  scope: ScopeData;
}

export function ScopeDetails({ scope }: ScopeDetailsProps) {
  const { data: functions = [], isLoading } = useContractAbi(
    scope.scope_key.slice(0, 42)
  );
  const functionInfo = functions.find((f) => f.selector === scope.selector);

  return (
    <div className="space-y-1">
      <span className="font-medium text-base">{scope.description}</span>
      <div className="w-full max-w-xl bg-wash p-4 rounded-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-secondary min-w-[60px]">Target</span>
            <code className="text-sm px-2 py-1 rounded text-tertiary break-all">
              {scope.scope_key.slice(0, 42)}
            </code>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-secondary min-w-[60px]">
              Function
            </span>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger>
                  <code className="text-sm px-2 py-1 rounded text-tertiary">
                    {isLoading
                      ? "Loading..."
                      : functionInfo
                        ? `${functionInfo.name} (${functionInfo.inputs.map((i) => i.type).join(", ")})`
                        : `${scope.selector}`}
                  </code>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{scope?.selector}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {scope.parameters && scope.parameters.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-primary">Parameters</h3>
              {scope.parameters.map((param: string, idx: number) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-secondary min-w-[60px]">
                      Value
                    </span>
                    <span className="text-sm text-tertiary break-all">
                      {param}
                    </span>
                  </div>
                  {scope.comparators &&
                    scope.comparators[idx] !== undefined && (
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-secondary min-w-[60px]">
                          Compare
                        </span>
                        <span className="text-sm text-tertiary">
                          {
                            ["Empty", "Equal", "Less Than", "Greater Than"][
                              scope.comparators[idx]
                            ]
                          }
                        </span>
                      </div>
                    )}
                  {scope.types && scope.types[idx] !== undefined && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-secondary min-w-[60px]">
                        Type
                      </span>
                      <span className="text-sm text-tertiary">
                        {
                          [
                            "None",
                            "Uint8",
                            "Uint16",
                            "Uint32",
                            "Uint64",
                            "Uint128",
                            "Uint256",
                            "Address",
                            "Bytes32",
                          ][scope.types[idx]]
                        }
                      </span>
                    </div>
                  )}
                  {idx < (scope.parameters?.length ?? 0) - 1 && (
                    <div className="border-t border-line my-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
