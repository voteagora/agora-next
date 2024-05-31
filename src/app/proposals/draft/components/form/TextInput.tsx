type TextInputProps = React.ComponentPropsWithoutRef<"input"> & {
  name: string;
  //   register: ReturnType<typeof useForm>["register"];
  register: any; // todo -- type properly
  placeholder?: string;
  required?: boolean;
  options?: any;
  units?: string;
  errorMessage?: string;
};

const TextInput = ({
  register,
  name,
  placeholder,
  required = false,
  options,
  units,
  errorMessage,
  ...props
}: TextInputProps) => {
  return (
    <div className="relative">
      <input
        type="text"
        className={`border bg-agora-stone-50 border-agora-stone-100 placeholder:text-agora-stone-500 p-2 rounded-lg w-full`}
        {...register(name, { required, ...options })}
        placeholder={placeholder}
        {...props}
      />
      {units && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-agora-stone-500">
          {units}
        </span>
      )}
      {/* TODO: only show if this field has been touched */}
      {!!errorMessage && (
        <p className="text-red-500 text-sm mb-0 mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

export default TextInput;
