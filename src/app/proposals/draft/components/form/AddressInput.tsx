import { useFormContext } from "react-hook-form";
import { useEnsAddress, useEnsName } from "wagmi";
import { isAddress } from "viem";

const AddressInput = ({
  name,
  errorMessage,
}: {
  name: string;
  errorMessage?: string;
}) => {
  const { register, watch, setValue } = useFormContext();

  const address = watch(name);

  const { data: ensAddress } = useEnsAddress({
    chainId: 1,
    name: address?.trim(),
    enabled: address?.trim()?.split("."),
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
        setValue(name, ensAddress);
      }
    }
  };

  return (
    <>
      <input
        type="text"
        className="border bg-agora-stone-50 border-agora-stone-100 placeholder:text-agora-stone-500 p-2 rounded-lg w-full"
        placeholder="0x..."
        {...register(name)}
        onBlur={() => {
          if (!isAddress(address) && ensAddress != null) {
            setValue(name, ensAddress);
          }
        }}
        onKeyDown={handleKeyDown}
      />
      <p className="text-xs text-neutral-500 mt-1">{buildHint()}</p>
      {errorMessage && (
        <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
      )}
    </>
  );
};

export default AddressInput;
