import Link from "next/link";

interface RedirectAfterDelayProps {
  message: string;
  linkURI: string;
  linkTitle: string;
}

export const RedirectAfterSuccess = ({
  message,
  linkURI,
  linkTitle,
}: RedirectAfterDelayProps) => {
  return (
    <div className="rounded-lg bg-green-200 border border-green-300 p-4">
      <div className="text-sm font-semibold">{message}</div>
      <div className="text-sm text-gray-700 underline">
        <Link href={linkURI}>{linkTitle}</Link>
      </div>
    </div>
  );
};
