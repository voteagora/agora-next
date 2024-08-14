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
  const { watch, setValue } = useFormContext();

  const address = watch(name);

  const { data: ensAddress } = useEnsAddress({
    chainId: 1,
    name: address?.trim(),
    enabled: address?.trim()?.split(".")?.[1] === "eth",
  });

  const { data: ensName } = useEnsName({
    chainId: 1,
    address: address?.trim(),
    enabled: isAddress(address?.trim()),
  });

  const buildHint = () => {
    if (isAddress(address)) {
      if (ensName != null)
        return (
          <>
            Primary ENS name: <span>{ensName}</span>
          </>
        );
    }

    if (ensAddress != null) return ensAddress;
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!isAddress(address) && ensAddress != null) {
        setValue(name, ensAddress as any);
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
                className={`border bg-wash border-line placeholder:text-tertiary p-2 rounded-lg w-full`}
                onBlur={() => {
                  if (!isAddress(address) && ensAddress != null) {
                    setValue(name, ensAddress as any);
                  }
                }}
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
