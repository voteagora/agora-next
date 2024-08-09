"use client";

type Props = {
  onSelectionChanged: (newSelection: any) => void;
  selection: string;
  options: string[];
};

const optionStyle =
  "p-[5px] flex-1 text-center cursor-pointer rounded-md text-primary/30 font-medium hover:bg-line hover:font-semibold transition-all";

const selectedStyle = "bg-line text-primary font-semibold";

export function Switch({ onSelectionChanged, selection, options }: Props) {
  return (
    <div className="flex flex-row gap-2 rounded-md border border-line overflow-hidden w-full p-1">
      {options.map((option, index) => (
        <div
          key={index}
          onClick={() => onSelectionChanged(option)}
          className={`${optionStyle}  ${
            selection === option ? selectedStyle : ""
          }`}
        >
          {option}
        </div>
      ))}
    </div>
  );
}
