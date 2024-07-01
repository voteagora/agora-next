import { cn } from "@/lib/utils";

type FormItemProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

const FormItem = ({
  label,
  children,
  required,
  htmlFor,
  className,
}: FormItemProps) => {
  return (
    <div className={cn("flex flex-col flex-1", className)}>
      <label className="text-xs font-semibold text-agora-stone-700 mb-1">
        {label} {required && <span className="text-agora-stone-700">*</span>}
      </label>
      {children}
    </div>
  );
};

export default FormItem;
