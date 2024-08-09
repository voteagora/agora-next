import { cn } from "@/lib/utils";
import InfoPop from "@/components/shared/InfoPop";

type FormItemProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  info?: string;
  children: React.ReactNode;
};

const FormItem = ({
  label,
  children,
  required,
  htmlFor,
  info,
  className,
}: FormItemProps) => {
  return (
    <div className={cn("flex flex-col flex-1", className)}>
      <div className="flex flex-row items-center mb-1">
        <label className="text-xs font-semibold text-secondary">
          {label}
          {required && <span className="text-secondary">*</span>}
        </label>
        {info && (
          <InfoPop>
            <span className="text-sm">{info}</span>
          </InfoPop>
        )}
      </div>
      {children}
    </div>
  );
};

export default FormItem;
