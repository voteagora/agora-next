import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="isolate inline-flex rounded-md shadow-sm">
      <Link
        href="/"
        className="proposalsNav relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
      >
        Proposals
      </Link>
      <Link
        href="/delegates"
        className="delegatesNav relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
      >
        Delegates
      </Link>
    </nav>
  );
}