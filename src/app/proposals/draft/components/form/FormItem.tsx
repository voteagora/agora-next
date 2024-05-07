type FormItemProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
};

const FormItem = ({ label, children, required, htmlFor }: FormItemProps) => {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-agora-stone-700 mb-1">
        {label} {required && <span className="text-agora-stone-700">*</span>}
      </label>
      {children}
    </div>
  );
};

export default FormItem;
