import { useContractAbi } from "@/hooks/useContractAbi";
import { ScopeData } from "@/lib/types";

interface ScopeDetailsProps {
  scope: ScopeData;
}

export function ScopeDetails({ scope }: ScopeDetailsProps) {
  const { data: functions = [], isLoading } = useContractAbi(
    `0x${scope.scope_key.slice(0, 40)}`
  );
  const functionInfo = functions.find(
    (f) => f.selector === `0x${scope.selector}`
  );

  return (
    <div className="flex flex-col items-start gap-2 text-sm text-tertiary">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">Target:</span>
          <code className="text-xs bg-wash px-2 py-0.5 rounded">
            {`0x${scope.scope_key.slice(0, 40)}`}
          </code>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Function:</span>
          <code className="text-xs bg-wash px-2 py-0.5 rounded">
            {isLoading
              ? "Loading..."
              : `${functionInfo?.name} (${functionInfo?.inputs.map((i) => i.type).join(", ")})` ||
                `0x${scope.selector}`}
          </code>
        </div>
      </div>
      {scope.parameters && scope.parameters.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="font-medium">Parameters:</span>
          <div className="flex flex-col gap-1">
            {scope.parameters.map((param, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-tertiary">Value:</span>
                  <code className="text-xs bg-wash px-2 py-0.5 rounded">
                    {param}
                  </code>
                </div>
                {scope.comparators && scope.comparators[idx] !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-tertiary">Comparison:</span>
                    <span className="text-xs text-tertiary">
                      {
                        ["Empty", "Equal", "Less Than", "Greater Than"][
                          scope.comparators[idx]
                        ]
                      }
                    </span>
                  </div>
                )}
                {scope.types && scope.types[idx] !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-tertiary">Type:</span>
                    <span className="text-xs text-tertiary">
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
