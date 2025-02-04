import { Delegation } from "@/app/api/common/delegations/delegation";
import ENSAvatar from "@/components/shared/ENSAvatar";
import { useEnsName } from "wagmi";
import { Input } from "@/components/ui/input";
import Tenant from "@/lib/tenant/tenant";
import { formatUnits } from "viem";
import { useEffect, useState } from "react";
import { formatPercentageWithPrecision } from "@/lib/utils";
import ENSName from "@/components/shared/ENSName";

interface Props {
  delegation: Delegation;
  onChange: (delegation: Delegation) => void;
  total: BigInt;
  reset: number;
}

export const PartialDelegationEntry = ({
  delegation,
  total,
  onChange,
  reset,
}: Props) => {
  const { token } = Tenant.current();

  const [value, setValue] = useState(
    Number(delegation.percentage) *
      Number(formatUnits(total as any, token.decimals))
  );
  const [percentage, setPercentage] = useState(
    Number(delegation.percentage) * 100
  );
  const [error, setError] = useState(false);

  const { data: ensName } = useEnsName({
    chainId: 1,
    address: delegation.to as `0x${string}`,
  });

  // Force-reset values when via reset prop for the following use-cases:
  // - when delegations are recalculated evenly
  // - when force-resetting to the original values
  useEffect(() => {
    setValue(
      Number(delegation.percentage) *
        Number(formatUnits(total as any, token.decimals))
    );
    setPercentage(Number(delegation.percentage) * 100);
    // NOTE: only the reset value is used as a dependency to avoid unnecessary
    // resets when values change inside the component
  }, [reset]);

  return (
    <div className="flex flex-row justify-between border-b border-dashed border-line py-4 last:border-b-0">
      <div className="flex flex-row gap-4">
        <ENSAvatar ensName={ensName} className="h-10 w-10" />
        <div className="flex flex-col">
          <div className="text-xs font-medium text-secondary">Delegated to</div>
          <div className="text-primary w-full font-medium text-ellipsis overflow-hidden max-w-[6rem] sm:max-w-[8rem]">
            <ENSName address={delegation.to} />
          </div>
        </div>
      </div>
      <div>
        <div
          className={`relative flex rounded-md border ${error ? "border-red-500" : "border-line"} bg-wash`}
        >
          <Input
            value={value}
            placeholder="0"
            className="text-primary max-w-[4rem] pl-2 pr-1 text-right focus:outline-none focus:ring-0"
            variant="none"
            onChange={(e) => {
              setValue(e.target.value as any);
              const newPercent =
                (Number(e.target.value) /
                  Number(formatUnits(total as any, token.decimals))) *
                100;
              if (newPercent >= 0 && newPercent <= 100) {
                setPercentage(newPercent);
                setError(false);

                onChange({
                  ...delegation,
                  percentage: (
                    Number(e.target.value) /
                    Number(formatUnits(total as any, token.decimals))
                  ).toString(),
                });
              } else {
                setError(true);
              }
            }}
            type="text"
            inputMode="numeric"
          />
          <div className="flex items-center pr-2 pl-1 w-[100px]">
            <p className="text-secondary text-sm">{token.symbol}</p>
            <div className="border-r border-line w-[1px] h-6 mx-1"></div>
            <p className="text-secondary text-sm">
              {formatPercentageWithPrecision(percentage, 2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
