export default function BetaBanner() {
  return (
    <div className="relative isolate bg-orange-200 px-6 py-2 sm:px-3.5">
      <div className="flex justify-center items-center h-full">
        <p className="font-medium text-xs leading-4 text-orange-800 text-center">
          Agora beta: some features are still in development. Please report bugs
          and feedback{" "}
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
