export default function BetaBanner() {
  return (
    <div className="relative isolate bg-stone-800 px-6 py-1 sm:px-3.5">
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
        <p className="font-medium text-xs leading-6 text-white">
          <strong className="font-semibold">Agora Beta</strong>
          <svg
            viewBox="0 0 2 2"
            className="mx-2 inline h-0.5 w-0.5 fill-current"
            aria-hidden="true"
          >
            <circle cx={1} cy={1} r={1} />
          </svg>
          Some features are still in development. Please report bugs and
          feedback{" "}
          <a
            href="https://app.deform.cc/form/7180b273-7662-4f96-9e66-1eae240a52bc/"
            target="_blank"
            className="underline"
          >
            using this form.
          </a>
        </p>
      </div>
    </div>
  );
}
