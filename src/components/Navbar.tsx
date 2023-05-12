import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <Link href="/" className="proposalsNav">
        Proposals
      </Link>
      <Link href="/delegates" className="delegatesNav">
        Delegates
      </Link>
    </nav>
  );
}