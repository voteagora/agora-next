import { HStack, VStack } from "@/components/Layout/Stack";
import { Link } from "@tanstack/react-router";

export default function RetroPGFHero() {
  return (
    <VStack className="max-w-6xl gap-4 mt-12">
      <HStack className="justify-between items-center">
        <div className="text-2xl font-extrabold">
          Total OP allocated to each category
        </div>
        <Link
          className="text-secondary hover:text-primary transition-colors ease-in-out delay-200"
          to="/retropgf/3/summary"
        >
          View more stats →
        </Link>
      </HStack>
      <img
        src="/rpgf/infographic_5.png"
        alt="RetroPGF 3 results 5"
        className="w-full max-w-6xl rounded-xl border border-line"
        height={1216}
        width={1216}
      />
    </VStack>
  );
}
