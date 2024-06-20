import { VStack } from "@/components/Layout/Stack";

export default function RetroPGFApplicationContentFundingSource({
  fundingSources,
}: {
  fundingSources: {
    type: string;
    currency: string;
    amount: number;
    description: string;
  }[];
}) {
  return (
    <VStack className="pt-4 sm:px-4">
      <h2 className="font-inter font-black text-2xl leading-[29px] text-primary">
        Funding sources
      </h2>
      <VStack className="items-stretch sm:items-normal justify-end sm:justify-start w-full h-auto sm:h-full my-8 py-2 px-4 rounded-xl border border-line shadow-newDefault min-h-[3rem]">
        {(!fundingSources || fundingSources.length === 0) && (
          <VStack className="items-center justify-center p-8 text-secondary">
            No funding sources provided
          </VStack>
        )}
        {fundingSources?.map((fundingSource) => (
          <div
            key={fundingSource.description}
            className="flex flex-col sm:flex-row items-stretch sm:items-normal justify-end sm:justify-start p-4"
          >
            <div className="flex-grow-0 flex-shrink-0 basis-1/5">
              {formatFundingSource(fundingSource.type)}
            </div>

            <div className="flex-1 text-secondary">
              {fundingSource.description}
            </div>
            <div className="flex-grow-0 flex-shrink-0 basis-1/5 text-right">
              {formatNumber(fundingSource.amount)} {fundingSource.currency}
            </div>
          </div>
        ))}
      </VStack>
    </VStack>
  );
}

function formatFundingSource(fundingSource: string) {
  if (fundingSource.split("_")[0].toLowerCase() === "retropgf") {
    return "RetroPGF " + fundingSource.split("_")[1];
  }
  return (
    fundingSource.charAt(0).toUpperCase() + fundingSource.slice(1).toLowerCase()
  )
    .split("_")
    .join(" ");
}

function formatNumber(number: number) {
  const numberFormat = new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "code",
    maximumFractionDigits: 2,
  });

  const parts = numberFormat.formatToParts(number);
  return parts
    .filter((part) => part.type !== "currency" && part.type !== "literal")
    .map((part) => part.value)
    .join("");
}
