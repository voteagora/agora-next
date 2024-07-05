import { useState, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";

type DateInputProps = {
  control: any;
  name: string;
};

const formatDate = (date: Date) => {
  // Get the year, month, and day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");

  // Return the formatted date string
  return `${year}-${month}-${day}`;
};

function getValueByStringKey(obj: any, key: string) {
  return key.split(".").reduce((acc, current) => {
    return acc && acc[current] ? acc[current] : undefined;
  }, obj);
}

const DateInput = ({ name }: DateInputProps) => {
  const [value, setValue] = useState("");
  const {
    control,
    getValues,
    formState: { errors },
  } = useFormContext();

  //make sure default value is set
  useEffect(() => {
    const date = getValues(name);
    const formattedDate = formatDate(new Date(date));
    setValue(formattedDate);
  }, []);

  return (
    <>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange } }) => (
          <input
            value={value}
            defaultValue={value}
            onChange={(e: any) => {
              console.log(e.target.value);
              setValue(e.target.value);
              onChange(e.target.value);
            }}
            type="date"
            className="bg-agora-stone-50 border border-agora-stone-100 rounded-lg text-agora-stone-900 placehoder:text-agora-stone-500 w-full"
          />
        )}
      />
      {getValueByStringKey(errors, name) && (
        <p className="text-red-500 text-sm mb-0 mt-1">
          {getValueByStringKey(errors, name)?.message}
        </p>
      )}
    </>
  );
};

export default DateInput;
