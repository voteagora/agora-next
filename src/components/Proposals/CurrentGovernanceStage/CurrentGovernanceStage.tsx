import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

export default function CurrentGovernanceStage({
  title,
  endDate,
  reviewPeriod,
}: {
  title: string;
  endDate: Date;
  reviewPeriod: boolean;
}) {
  const currentDate = new Date();
  const differenceInMilliseconds = endDate.getTime() - currentDate.getTime();
  const differenceInDays = Math.floor(
    differenceInMilliseconds / (1000 * 60 * 60 * 24)
  );
  return (
    <div className="flex items-center justify-between bg-gray-fa text-gray-700 text-xs px-6 pt-2 pb-6 -mb-5 border border-gray-300 border-b-0 rounded-tl-2xl rounded-tr-2xl">
      <div className="flex flex-col sm:flex-row">
        <div className="flex">
          <span className="hidden sm:block">Currently in&nbsp;</span>
          <span>{title}</span>
        </div>
        <span className="hidden sm:block">&nbsp;·&nbsp;</span>
        <span>
          Voting {reviewPeriod ? "starts" : "ends"} in around {differenceInDays}{" "}
          {differenceInDays === 1 ? "day" : "days"}
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
