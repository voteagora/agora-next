type NumberInputProps = React.ComponentPropsWithoutRef<"input"> & {
  name: string;
  //   register: ReturnType<typeof useForm>["register"];
  register: any; // todo -- type properly
  placeholder?: string;
  required?: boolean;
  options?: any;
  errorMessage?: string;
};

const NumberInput = ({
  register,
  name,
  placeholder,
  required = false,
  options,
  errorMessage,
  ...props
}: NumberInputProps) => {
  return (
    <div className="relative">
      <input
        type="number"
        className={`border bg-agora-stone-50 border-agora-stone-100 placeholder:text-agora-stone-500 p-2 rounded-lg w-full`}
        {...register(name, { required, ...options })}
        placeholder={placeholder}
        {...props}
      />
      {!!errorMessage && (
        <p className="text-red-500 text-sm mb-0 mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

export default NumberInput;
