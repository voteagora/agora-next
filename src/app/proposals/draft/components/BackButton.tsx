"use client";

import Link from "next/link";

const BackButton = ({ index }: { index: number }) => {
  return (
    <Link
      className="cursor-pointer"
      href={`/proposals/draft?stage=${index - 1}`}
    >
      back
    </Link>
  );
};

export default BackButton;
