import { Controller } from "react-hook-form";

type DateInputProps = {
  control: any;
  name: string;
};
const DateInput = ({ name, control }: DateInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange } }) => (
        <input
          onChange={onChange}
          type="date"
          className="bg-agora-stone-50 border border-agora-stone-100 rounded-lg text-agora-stone-500 w-full"
        />
      )}
    />
  );
};

export default DateInput;
