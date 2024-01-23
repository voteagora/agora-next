import Image from "next/image";
import { HStack, VStack } from "@/components/Layout/Stack";
import Link from "next/link";

export default function RetroPGFHero() {
  return (
    <VStack className="max-w-6xl gap-4 mt-12">
      <HStack className="justify-between items-center">
        <div className="text-2xl font-extrabold">
          Total OP allocated to each category
        </div>
        <Link
          className="text-gray-700 hover:text-black transition-colors ease-in-out delay-200"
          href="/retropgf/3/summary"
        >
          View more stats →
        </Link>
      </HStack>
      <Image
        src="/rpgf/infographic_5.png"
        alt="RetroPGF 3 results 5"
        className="w-full max-w-6xl rounded-xl border border-gray-300"
        height="1216"
        width="1216"
      />
    </VStack>
  );
}
