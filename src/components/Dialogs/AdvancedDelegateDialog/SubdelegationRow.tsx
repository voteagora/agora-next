import { HStack, VStack } from "@/components/Layout/Stack";
import ENSAvatar from "@/components/shared/ENSAvatar";
import HumanAddress from "@/components/shared/HumanAddress";
import { Input } from "@/components/ui/input";
import styles from "./advancedDelegateDialog.module.scss";
import { useEnsName } from "wagmi";
import { formatUnits } from "viem";
import { useState, Dispatch, SetStateAction, useEffect } from "react";

function SubdelegationToRow({
  to,
  setAllowance,
  availableBalance,
  allowances,
  index,
}: {
  to: string;
  setAllowance: Dispatch<SetStateAction<number[]>>;
  availableBalance: string;
  allowances: number[];
  index: number;
}) {
  const [newAllowanceInput, setNewAllowanceInput] = useState("");

  const allowance = allowances[index];
  const { data } = useEnsName({
    chainId: 1,
    address: to as `0x${string}`,
  });
  const availableBalanceNumber = Number(
    formatUnits(BigInt(availableBalance), 18)
  );

  const sumOtherAllowances = allowances.reduce((sum, current, idx) => {
    return idx === index ? sum : sum + current;
  }, 0);

  const amountToAllocate = availableBalanceNumber - sumOtherAllowances;

  const percent =
    Number.isNaN(allowance) || allowance === 0
      ? 0
      : Math.round((allowance / availableBalanceNumber) * 100_00) / 100;

  function formatNumber(value: number) {
    return Math.floor(Math.round(value * 10000) / 10) / 1000;
  }

  function getCleanInput(value: string) {
    let cleanedInput = "";

    // remove commas, eg 100,000,000 becomes 100000000
    cleanedInput = value.replace(/,/g, "");

    // allow only 3 decimal points
    const decimalIndex = cleanedInput.indexOf(".");
    if (decimalIndex !== -1) {
      cleanedInput = cleanedInput.slice(0, decimalIndex + 4);
    }

    return cleanedInput;
  }

  const handleAllowanceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAllowanceInputClean = getCleanInput(e.target.value);

    if (newAllowanceInputClean === "") {
      // handle empty input
      setNewAllowanceInput("");
      const newAllowances = [...allowances];
      newAllowances[index] = 0;
      setAllowance(newAllowances);
      return;
    }

    if (isNaN(Number(newAllowanceInputClean))) {
      // dont allow non numbers (including using commas for decimals like 10,123)
      return;
    }

    const newAllowanceValue = parseFloat(newAllowanceInputClean);

    if (!isNaN(newAllowanceValue) && newAllowanceValue >= 0) {
      const newAllowances = [...allowances];

      if (newAllowanceValue > amountToAllocate) {
        newAllowances[index] = formatNumber(amountToAllocate);
        setNewAllowanceInput(amountToAllocate.toLocaleString("en-US"));
      } else {
        newAllowances[index] = formatNumber(newAllowanceValue);
        setNewAllowanceInput(newAllowanceInputClean);
      }

      setAllowance(newAllowances);
    }
  };

  useEffect(() => {
    if (allowance !== 0 && newAllowanceInput === "") {
      setNewAllowanceInput(allowance.toLocaleString("en-US"));
    }
  }, [allowance, newAllowanceInput]);

  return (
    <div className={styles.sub_row}>
      <HStack gap={3}>
        <div className={styles.avatar}>
          <ENSAvatar ensName={data} />
        </div>
        <VStack>
          <p className={styles.subtitle}>Delegated to</p>
          <div className={styles.address_to}>
            <HumanAddress address={to} />
          </div>
        </VStack>
      </HStack>
      <div className="relative flex rounded-md border border-input bg-gray-fa">
        {/* TODO: improve UX of this Input, what if value is 10,000,000 */}
        <Input
          value={newAllowanceInput}
          placeholder="0"
          className="max-w-[4rem] pl-2 pr-1 text-right focus:outline-none focus:ring-0"
          variant="none"
          onChange={(e) => handleAllowanceInput(e)}
          type="text"
          inputMode="numeric"
        />
        <div className="flex items-center pr-2 pl-1 w-[100px]">
          <p>OP</p>
          <div className="bg-input w-[1px] h-6 mx-1"></div>
          <p>{percent}%</p>
        </div>
      </div>
    </div>
  );
}

export default SubdelegationToRow;
