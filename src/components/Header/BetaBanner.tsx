export default function BetaBanner() {
  return (
    <div className="relative isolate bg-red-600 px-6 py-2.5 sm:px-3.5">
      <div
        className="absolute left-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        aria-hidden="true"
      >
        <div className="aspect-[577/310] w-[36.0625rem]" />
      </div>
      <div
        className="absolute right-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        aria-hidden="true"
      >
        <div className="aspect-[577/310] w-[36.0625rem]" />
      </div>
      <div className="flex justify-center items-center h-full">
        <p className="text-sm leading-6 text-white">
          <strong className="font-semibold">Agora Beta</strong>
          <svg
            viewBox="0 0 2 2"
            className="mx-2 inline h-0.5 w-0.5 fill-current"
            aria-hidden="true"
          >
            <circle cx={1} cy={1} r={1} />
          </svg>
          Some features are still in development. Your feedback helps us
          improve.
        </p>
      </div>
    </div>
  );
}
