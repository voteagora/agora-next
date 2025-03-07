import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

export default function CurrentGovernanceStage({
  title,
  endDate,
  reviewPeriod,
  votingPeriod,
}: {
  title: string;
  endDate: string;
  reviewPeriod: boolean;
  votingPeriod: boolean;
}) {
  const showVotingCommand = votingPeriod || reviewPeriod;
  const startString = showVotingCommand ? "starts" : "Starts";
  const endString = showVotingCommand ? "ends" : "Ends";
  return (
    <div className="flex items-center justify-between bg-wash text-secondary text-xs px-6 pt-2 pb-6 -mb-5 border border-line border-b-0 rounded-tl-2xl rounded-tr-2xl">
      <div className="flex flex-col sm:flex-row">
        <div className="flex">
          <span className="hidden sm:block">Currently in&nbsp;</span>
          <span>{title}</span>
        </div>
        <span className="hidden sm:block">&nbsp;·&nbsp;</span>
        <span>
          {showVotingCommand ? "Voting " : ""}
          {reviewPeriod ? startString : endString} on {endDate}
        </span>
      </div>
      <a
        href="https://calendar.google.com/calendar/embed?src=c_fnmtguh6noo6qgbni2gperid4k%40group.calendar.google.com"
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center"
      >
        <p>View calendar</p>
        <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1 sm:ml-2" />
      </a>
    </div>
  );
}
