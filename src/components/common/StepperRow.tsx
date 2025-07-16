import Link from "next/link";
import Image from "next/image";
import linkIcon from "@/icons/link.svg";

interface StepperRowProps {
  label: string;
  value: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isLastStep?: boolean;
  href?: string;
}

export const StepperRow = ({
  label,
  value,
  isActive,
  isCompleted,
  isLastStep,
  href,
}: StepperRowProps) => {
  return (
    <li
      className={`relative flex-1  ${!isLastStep && "after:content-[''] after:w-[1.5px] after:h-[35px]  after:bg-line after:inline-block after:absolute after:top-3 after:left-0.5"} `}
    >
      <Link href={href ?? "#"} className="flex items-center gap-x-3">
        <div
          className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-black" : isActive ? "bg-blue-600" : "bg-primary/30"}`}
        />

        <div className="w-full flex items-center justify-between text-xs font-semibold">
          <div
            className={`${isCompleted ? "text-primary" : isActive ? "text-blue-600" : "text-secondary"} flex items-center gap-x-1`}
          >
            {label}
            {href && <Image src={linkIcon} alt="redirect" />}
          </div>

          <p className="text-xs font-medium text-secondary">{value}</p>
        </div>
      </Link>
    </li>
  );
};
