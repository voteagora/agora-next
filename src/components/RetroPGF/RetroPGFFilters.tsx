import RetroPGFSearch from "@/components/RetroPGF/RetroPGFSearch";
import RetroPGFCategoryFilter from "@/components/RetroPGF/RetroPGFCategoryFilter";
import RetroPGFSort from "@/components/RetroPGF/RetroPGFSort";

export default function RetroPGFFilters() {
  return (
    <div className="flex flex-col items-stretch w-full gap-2 sm:flex-row sm:justify-between sm:items-end mt-16">
      <div className="text-2xl font-extrabold">All RPGF3 recipients</div>
      <div className="flex flex-col sm:flex-row gap-2">
        <RetroPGFSearch />
        <RetroPGFCategoryFilter />
        <RetroPGFSort />
      </div>
    </div>
  );
}
