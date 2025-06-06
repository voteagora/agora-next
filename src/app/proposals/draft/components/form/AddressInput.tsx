import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import {
  ControllerProps,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEnsAddress, useEnsName } from "wagmi";
import { isAddress } from "viem";
import { useEffect } from "react";

type AddressInputProps = {
  label: string;
  placeholder?: string;
  required?: boolean;
  tooltip?: string;
};

function AddressInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  required,
  control,
  name,
  label,
  placeholder,
  tooltip,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & AddressInputProps) {
  const { watch, setValue, trigger } = useFormContext();

  const address = watch(name);

  const { data: ensAddress, isLoading: isLoadingEnsAddress } = useEnsAddress({
    chainId: 1,
    name: address?.trim(),
    query: {
      enabled:
        !!address && !isAddress(address.trim()) && address.trim().includes("."),
    },
  });

  useEffect(() => {
    if (ensAddress && address !== ensAddress) {
      setValue(name, ensAddress as any, { shouldValidate: true });
    }
  }, [ensAddress, name, setValue, address]);

  const { data: ensName } = useEnsName({
    chainId: 1,
    address: address?.trim(),
    query: { enabled: isAddress(address?.trim()) },
  });

  const buildHint = () => {
    if (isLoadingEnsAddress) {
      return "Resolving ENS...";
    }
    if (isAddress(address)) {
      if (ensName != null)
        return (
          <>
            Primary ENS name: <span>{ensName}</span>
          </>
        );
    }
    if (!isAddress(address) && ensAddress) return ensAddress;
    return null;
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!isAddress(address) && ensAddress) {
        setValue(name, ensAddress as any, { shouldValidate: true });
      } else {
        trigger(name);
      }
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex flex-row space-x-1">
                <FormLabel
                  className="text-xs font-semibold text-secondary"
                  isRequired={required}
                >
                  {label}
                </FormLabel>
                {!!tooltip && (
                  <QuestionMarkCircleIcon className="h-4 w-4 text-secondary" />
                )}
              </TooltipTrigger>
              {!!tooltip && (
                <TooltipContent className="text-sm max-w-[200px]">
                  {tooltip}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <FormControl>
            <div className="relative">
              <input
                {...field}
                type="text"
                className={`border bg-wash border-line placeholder:text-tertiary text-primary p-2 rounded-lg w-full`}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
              />
            </div>
          </FormControl>
          <FormDescription>{buildHint()}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default AddressInput;
