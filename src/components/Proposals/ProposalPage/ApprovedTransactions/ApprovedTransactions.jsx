import { VStack } from "@/components/Layout/Stack";
import OptionDescription from "./OptionDescription";
import CodeChange from "./CodeChange";
import { useState } from "react";
import { formatEther, formatUnits } from "viem";

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
      <p className="text-xs font-mono font-medium text-gray-af leading-4 mb-2 px-4">
        Proposed Transactions - only approved options will execute
      </p>
      <VStack className="px-4">
        {proposalData.options
          .slice(0, displayedOptions)
          .map((option, index) => {
            const value = parseFloat(
              formatUnits(option.values[0], 18)
            ).toLocaleString("en-US");
            const valueETH =
              option.values[0] > 0
                ? `{ value: ${formatEther(option.values[0])} ETH }`
                : undefined;

            return (
              <div key={index}>
                <p className="text-xs font-mono font-medium text-gray-af leading-4">
                  <OptionDescription
                    description={option.description}
                    value={value}
                    target={option.targets[0]}
                  />
                </p>
                <CodeChange
                  target={option.targets[0]}
                  calldata={option.calldatas[0]}
                  valueETH={valueETH}
                  functionName={option.functionName}
                  functionArgs={option.functionArgs}
                />
              </div>
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
