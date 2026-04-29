import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { ExecutionTxInspectorIconLink } from "@/components/Execution/ExecutionTxInspectorLink";

interface StepperRowProps {
  label: string;
  value: string;
  isCompleted?: boolean;
  isLastStep?: boolean;
  href?: string;
  executionInspectorTxHash?: string;
}

export const StepperRow = ({
  label,
  value,
  isCompleted,
  isLastStep,
  href,
  executionInspectorTxHash,
}: StepperRowProps) => {
  const colorClass = isCompleted ? "text-primary" : "text-secondary";

  return (
    <li
      className={`relative flex-1  ${!isLastStep && "after:content-[''] after:w-[1.5px] after:h-[35px]  after:bg-line after:inline-block after:absolute after:top-3 after:left-0.5"} `}
    >
      <div className="flex items-center gap-x-3">
        <div
          className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-black" : "bg-primary/30"}`}
        />

        <div className="w-full flex items-center justify-between text-xs font-semibold">
          <div className={`${colorClass} flex items-center gap-x-1`}>
            {href ? (
              <span className="inline-flex items-center gap-x-1">
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-x-1 hover:underline"
                >
                  {label}
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                </a>
                {executionInspectorTxHash ? (
                  <ExecutionTxInspectorIconLink
                    txHash={executionInspectorTxHash}
                    iconClassName="h-3 w-3"
                  />
                ) : null}
              </span>
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
