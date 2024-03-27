import { VStack } from "@/components/Layout/Stack";
import OptionDescription from "./OptionDescription";
import CodeChange from "./CodeChange";
import { useState } from "react";
import { formatEther } from "viem";

export default function ApprovedTransactions({ proposalData }) {
  const [displayedOptions, setDisplayedOptions] = useState(1);
  const toggleElements = () => {
    displayedOptions === 1
      ? setDisplayedOptions(proposalData.options.length)
      : setDisplayedOptions(1);
  };

  if (proposalData.options.length === 0) {
    return null;
  }

  return (
    <VStack
      gap="1"
      className="border border-[#e0e0e0] rounded-lg bg-gray-fa py-4"
    >
      <p className="px-4 mb-2 font-mono text-xs font-medium leading-4 text-gray-af">
        {/* TODO: frh -> no proposed transactions */}
        Proposed Transactions (signal only – transactions are manually executed
        by the Foundation)
      </p>
      <VStack className="px-4">
        {proposalData.options
          .slice(0, displayedOptions)
          .map((option, index) => {
            return option.values.length > 0 ? (
              option.targets.map((t, i) => {
                const valueETH =
                  option.values[i] > 0
                    ? `{ value: ${formatEther(option.values[i])} ETH }`
                    : undefined;
                return (
                  <div key={index}>
                    <p className="font-mono text-xs font-medium leading-4 text-gray-af">
                      <OptionDescription
                        key={i}
                        description={option.description}
                        // TODO: frh -> this budgetTokensSpent
                        value={option.budgetTokensSpent || BigInt(0)}
                        target={option.targets[i]}
                      />
                    </p>
                    <CodeChange
                      target={option.targets[i]}
                      valueETH={valueETH}
                      functionName={option.functionArgsName[i].functionName}
                      functionArgs={option.functionArgsName[i].functionArgs}
                    />
                  </div>
                );
              })
            ) : (
              <p className="font-mono text-xs font-medium leading-4 text-gray-af">
                {"//"} {option.description}
              </p>
            );
          })}
      </VStack>
      {proposalData.options.length > 1 && (
        <div
          className="cursor-pointer text-xs font-mono font-medium text-gray-af leading-4 p-4 pb-0 border-t border-gray-eo"
          onClick={toggleElements}
        >
          {displayedOptions === 1
            ? `Reveal ${proposalData.options.length - 1} more options`
            : "Hide options"}
        </div>
      )}
    </VStack>
  );
}
