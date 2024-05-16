import { useFormContext } from "react-hook-form";
import { useEnsAddress } from "wagmi";

const AddressInput = ({ name }: { name: string }) => {
  const { register, watch } = useFormContext();

  const address = watch(name);

  const { data: ensAddress } = useEnsAddress({
    chainId: 1,
    name: address,
  });

  return (
    <>
      <input
        type="text"
        className="block w-full rounded-md border-0 p-1.5 text-neutral-900 ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
        placeholder="lilfrog.eth"
        {...register(name)}
      />
      <p className="text-xs text-neutral-500 mt-1">{ensAddress}</p>
    </>
  );
};

export default AddressInput;
