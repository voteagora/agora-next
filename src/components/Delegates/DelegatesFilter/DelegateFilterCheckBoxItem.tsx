import { CheckIcon } from "@heroicons/react/20/solid";

type DelegateFilterCheckBoxItemProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

export const DelegateFilterCheckBoxItem = ({
  label,
  checked,
  onChange,
}: DelegateFilterCheckBoxItemProps) => (
  <div className="inline-flex justify-start items-center gap-3">
    <div onClick={onChange} className="w-5 h-5 relative cursor-pointer">
      {checked ? (
        <div className="w-5 h-5 left-0 top-0 absolute bg-positive rounded">
          <div className="w-3.5 h-3.5 left-[3px] top-[3px] absolute">
            <CheckIcon className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      ) : (
        <div className="w-5 h-5 left-0 top-0 absolute rounded border border-positive" />
      )}
    </div>
    <div className={checked ? "text-primary" : "text-secondary"}>{label}</div>
  </div>
);
