import { Vote } from "@/app/api/common/votes/vote";
import {
  CheckIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  Bars2Icon,
} from "@heroicons/react/20/solid";

function DelegateVoteIcon({
  proposalType,
  support,
}: {
  proposalType: Vote["proposalType"];
  support: string;
}) {
  if (proposalType === "STANDARD" || proposalType === "OPTIMISTIC") {
    if (support === "FOR")
      return (
        <span className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-green-600 self-start">
          <CheckIcon className="h-3 w-3 text-neutral" />
        </span>
      );
    if (support === "AGAINST")
      return (
        <span className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-red-600 self-start">
          <XMarkIcon className="h-3 w-3 text-neutral" />
        </span>
      );
    if (support === "ABSTAIN")
      return (
        <span className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-black self-start">
          <EllipsisVerticalIcon className="h-3 w-3 text-neutral" />
        </span>
      );
  } else if (proposalType === "APPROVAL")
    return (
      <span className="h-5 w-5 shrink-0 flex items-center justify-center  rounded-full bg-tertiary self-start">
        <Bars2Icon className="h-3 w-3 text-neutral" />
      </span>
    );

  return <></>;
}

export default DelegateVoteIcon;
