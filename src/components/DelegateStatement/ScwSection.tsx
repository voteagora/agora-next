import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";
import { useAccount } from "wagmi";
import type { UseFormReturn } from "react-hook-form";
import type { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import { FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";


interface Props {
  form: UseFormReturn<DelegateStatementFormValues>;
}
export const ScwSection = ({form}:Props) => {

  const { address } = useAccount();
  const { data } = useSmartAccountAddress({
    owner: address,
  });

  return         <FormField
    control={form.control}
    name="scwAddress"
    render={({ field }) => (
      <Label variant="black">
        <Input
          hidden={true}
          placeholder={data?.toString()}
          {...field}
          value={data?.toString()}
        />
      </Label>
    )}
  />

};