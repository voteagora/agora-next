import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxWithTitleProps {
  title: string | React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const CheckboxWithTitle: React.FC<CheckboxWithTitleProps> = ({
  title,
  label,
  checked,
  onChange,
}) => {
  const id = useId(); // Generate a unique ID

  return (
    <>
      <h4 className="flex items-center mb-3 text-secondary font-semibold text-xs leading-4">
        {title}
      </h4>
      <div className="flex items-center mb-4 font-semibold text-primary">
        <label htmlFor={id} className="flex items-center cursor-pointer">
          {" "}
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={onChange}
            className="mr-2"
          />
          {label}
        </label>
      </div>
    </>
  );
};

export default CheckboxWithTitle;
