import Image from "next/image";
import { HStack, VStack } from "@/components/Layout/Stack";
import Link from "next/link";
import RetroPGFSearch from "@/components/RetroPGF/RetroPGFSearch";
import RetroPGFCategoryFilter from "@/components/RetroPGF/RetroPGFCategoryFilter";
import RetroPGFSort from "@/components/RetroPGF/RetroPGFSort";

export default function RetroPGFFilters() {
  return (
    // TODO: frh -> check width full here
    <div className="flex flex-col items-stretch w-full gap-2 sm:flex-row sm:justify-between sm:items-end">
      <div className="text-2xl font-extrabold">All RPGF3 recipients</div>
      <div>
        <RetroPGFSearch />
        <RetroPGFCategoryFilter />
        <RetroPGFSort />
      </div>
    </div>
  );
}
