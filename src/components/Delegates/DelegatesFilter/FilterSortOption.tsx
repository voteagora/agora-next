import { DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type SortOptionProps = {
  label: string;
  value: string;
  checked: boolean;
};

export const SortOption = ({ label, value, checked }: SortOptionProps) => (
  <DropdownMenuRadioItem
    value={value}
    checked={checked}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-lg p-3 text-base outline-none transition-colors hover:bg-neutral/50",
      checked ? "text-primary" : "text-secondary"
    )}
  >
    {label}
  </DropdownMenuRadioItem>
);

export type MobileSortOptionProps = {
  label: string;
  checked: boolean;
  onClick: () => void;
};

export const MobileSortOption = ({
  label,
  checked,
  onClick,
}: MobileSortOptionProps) => (
  <button
    onClick={onClick}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-lg text-base outline-none transition-colors hover:bg-neutral/50",
      checked ? "text-primary" : "text-secondary"
    )}
  >
    <span className="flex h-[20px] w-[20px] items-center justify-center mr-[12px]">
      <div
        className={cn(
          "w-[20px] h-[20px] rounded-full border transition-colors",
          checked ? "border-positive" : "border-line"
        )}
      >
        {checked && (
          <div className="w-2.5 h-2.5 absolute top-[7px] left-[5px] bg-positive rounded-full" />
        )}
      </div>
    </span>
    {label}
  </button>
);
