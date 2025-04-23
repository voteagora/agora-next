import { cn } from "@/lib/utils";

type CountBadgeProps = {
  count: number;
  border?: boolean;
  className?: string;
};

export const CountBadge = ({
  count,
  className,
  border = true,
}: CountBadgeProps) => (
  <div
    className={cn(
      "rounded-full flex justify-center",
      "h-6 w-6 bg-neutral",
      border && "border border-line",
      className
    )}
  >
    <div className="text-primary text-xs self-center">{count}</div>
  </div>
);

type MobileCountIndicatorProps = {
  count: number;
  className?: string;
};

export const MobileCountIndicator = ({
  count,
  className,
}: MobileCountIndicatorProps) => {
  if (count === 0) return null;
  return (
    <div
      className={cn(
        "rounded-full bg-brandPrimary flex justify-center",
        "absolute top-[-4px] right-[-4px] h-[10px] w-[10px]",
        className
      )}
    />
  );
};
