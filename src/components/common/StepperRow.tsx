import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

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
  const colorClass = isCompleted
    ? "text-primary"
    : isActive
      ? "text-blue-600"
      : "text-secondary";

  return (
    <li
      className={`relative flex-1  ${!isLastStep && "after:content-[''] after:w-[1.5px] after:h-[35px]  after:bg-line after:inline-block after:absolute after:top-3 after:left-0.5"} `}
    >
      <div className="flex items-center gap-x-3">
        <div
          className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-black" : isActive ? "bg-blue-600" : "bg-primary/30"}`}
        />

        <div className="w-full flex items-center justify-between text-xs font-semibold">
          <div className={`${colorClass} flex items-center gap-x-1`}>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:underline flex items-center gap-x-1"
              >
                {label}
                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
              </a>
            ) : (
              label
            )}
          </div>

          <p className="text-xs font-medium text-secondary">{value}</p>
        </div>
      </div>
    </li>
  );
};
