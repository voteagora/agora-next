export default function Loading() {
  return (
    <div className="flex flex-col">
      <div className="flex gap-8 lg:gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between mt-12">
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          <div className="h-6 w-1/2 rounded-md bg-tertiary/10 animate-pulse"></div>
          <div className="h-10 w-3/4 rounded-md bg-tertiary/10 animate-pulse"></div>
          <div className="h-24 w-full rounded-md bg-tertiary/10 animate-pulse mt-4"></div>
          <div className="h-64 w-full rounded-md bg-tertiary/10 animate-pulse mt-2"></div>
          <div className="h-32 w-full rounded-md bg-tertiary/10 animate-pulse mt-2"></div>
        </div>

        <div className="w-full md:w-1/3 mt-6 md:mt-0">
          <div className="border border-line rounded-lg p-6 bg-wash">
            <div className="h-4 w-1/2 rounded-md bg-tertiary/10 animate-pulse mb-4"></div>
            <div className="h-24 w-full rounded-md bg-tertiary/10 animate-pulse mb-4"></div>
            <div className="h-12 w-full rounded-md bg-tertiary/10 animate-pulse mb-4"></div>
            <div className="h-8 w-3/4 rounded-md bg-tertiary/10 animate-pulse"></div>
            <div className="h-8 w-3/4 rounded-md bg-tertiary/10 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
