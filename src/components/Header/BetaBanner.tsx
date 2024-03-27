import Link from "next/link";

export default function BetaBanner() {
  return (
    <div className="relative isolate bg-orange-200 px-6 py-2 sm:px-3.5 sm:min-w-desktop">
      <div className="flex justify-center items-center h-full">
        <p className="font-medium text-xs leading-4 text-orange-800 text-center">
          Welcome to the next version of Agora 👋. FYI: Agora will be down for
          maintenance March 30th: 1:00 - 1:30AM EST
        </p>
        {/* <p className="font-medium text-xs leading-4 text-orange-800 text-center">
          Welcome to the next version of Agora 👋. Please report bugs and
          feedback{" "}
          <a
            rel="noopener"
            href="https://app.deform.cc/form/7180b273-7662-4f96-9e66-1eae240a52bc/"
            target="_blank"
            className="underline"
          >
            using this form.
          </a>{" "}
          Follow the{" "}
          <Link className="underline" href="/changelog">
            changelog
          </Link>{" "}
          for updates.
        </p> */}
      </div>
    </div>
  );
}
