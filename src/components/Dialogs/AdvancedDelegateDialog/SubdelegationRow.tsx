import { HStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import { Input } from "@/components/ui/input";

function SubdelegationToRow({
  to,
  allowance,
  setAllowance,
}: {
  to: string;
  allowance: number;
  setAllowance: (value: number) => void;
}) {
  return (
    <HStack gap={2}>
      <HumanAddress address={to} />
      <Input
        value={allowance}
        onChange={(e) => setAllowance(parseInt(e.target.value))}
        type="number"
      />
    </HStack>
  );
}

export default SubdelegationToRow;
