"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="isolate inline-flex rounded-md shadow-sm">
      <Link
        href="/proposals"
        className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 ${
          pathname.includes("proposals") ? "active" : ""
        }`}
      >
        Proposals
      </Link>
      <Link
        href="/delegates"
        className={`relative -ml-px inline-flex items-center  px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 ${
          pathname.includes("delegates") ? "active" : ""
        }`}
      >
        Delegates
      </Link>
      <Link
        href="/events"
        className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 ${
          pathname.includes("events") ? "active" : ""
        }`}
      >
        Activity Feed
      </Link>
    </nav>
  );
}
