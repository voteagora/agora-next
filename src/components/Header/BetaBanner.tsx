import Link from "next/link";

export default function BetaBanner() {
  return (
    <div className="relative isolate bg-orange-200 px-6 py-2 sm:px-3.5 sm:min-w-desktop">
      <div className="flex justify-center items-center h-full">
        <p className="font-medium text-xs leading-4 text-orange-800 text-center">
          Welcome to the next version of Agora 👋. Please report bugs and
          feedback{" "}
          <a
            rel="noopener"
            href="https://github.com/voteagora/agora-next/issues/new?assignees=&labels=bug%3A+unconfirmed&projects=&template=0-bug.yml&title=%5BBug%5D%3A+"
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
        </p>
      </div>
    </div>
  );
}
