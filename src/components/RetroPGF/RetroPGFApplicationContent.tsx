import { HStack, VStack } from "@/components/Layout/Stack";
import { icons } from "@/icons/icons";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import RetroPGFApplicationContentFundingSource from "./RetroPGFApplicationContentFundingSource";
import { type RetroPGFProject } from "@/lib/types";
import Image from "next/image";

export default function RetroPGFApplicationContent({
  retroPGFProject,
}: {
  retroPGFProject: RetroPGFProject;
}) {
  const {
    contributionDescription,
    contributionLinks,
    impactDescription,
    impactMetrics,
    fundingSources,
  } = retroPGFProject;

  return (
    <VStack>
      <div className="flex flex-col sm:flex-row gap-0 sm:gap-16 sm:items-start justify-end sm:justify-between pb-0 sm:p-4 max-w-6xl">
        <VStack>
          <h2 className="font-inter font-black text-2xl leading-[29px] text-primary mb-[14px]">
            Contribution
          </h2>
          <div className="font-inter font-medium text-base leading-6 text-secondary pb-[14px] max-w-[calc(100vw-48px)] sm:max-w-auto whitespace-pre-wrap break-normal">
            {contributionDescription}
          </div>
        </VStack>
        <VStack className="mt-0 sm:my-8 items-stretch justify-end sm:justify-between w-full sm:w-[24rem] border border-line rounded-xl shadow-newDefault p-4 flex-shrink-0">
          <div>
            <h3 className="font-inter font-semibold text-sm leading-[16px] text-secondary">
              Contribution links
            </h3>
            <ul className="m-0 p-0 list-none">
              {contributionLinks.map((contributionLink) => (
                <ContributionLink
                  key={contributionLink.description}
                  contributionLink={contributionLink}
                />
              ))}
            </ul>
          </div>
        </VStack>
      </div>
      <div className="flex flex-col sm:flex-row gap-0 sm:gap-16 items-stretch sm:items-start justify-end sm:justify-between sm:px-4 py-8 max-w-6xl">
        <VStack>
          <h2 className="font-inter font-black text-2xl leading-[29px] text-primary mb-[14px]">
            Impact
          </h2>
          <div className="font-inter  font-medium text-base leading-6 text-secondary pb-[14px] max-w-[calc(100vw-48px)] sm:max-w-auto whitespace-pre-wrap">
            {impactDescription}
          </div>
        </VStack>

        <VStack className="mt-0 sm:my-8 justify-end sm:justify-between w-full sm:w-[24rem] border border-line rounded-xl shadow-newDefault p-4 flex-shrink-0">
          <div>
            <h3 className="font-inter font-semibold text-sm leading-4 text-secondary">
              Impact Metrics
            </h3>
            <VStack className="p-0 m-0 list-none">
              {impactMetrics.map((impactMetric) => (
                <ImpactMetric
                  key={impactMetric.description}
                  impactMetric={impactMetric}
                />
              ))}
            </VStack>
          </div>
        </VStack>
      </div>
      <RetroPGFApplicationContentFundingSource
        fundingSources={fundingSources}
      />
    </VStack>
  );
}

const ContributionLink = ({
  contributionLink,
}: {
  contributionLink: {
    type: string;
    url: string;
    description: string;
  };
}) => {
  const icon = (() => {
    switch (contributionLink.type) {
      case "CONTRACT_ADDRESS":
        return "scroll";
      case "GITHUB_REPO":
        return "github";
      case "OTHER":
        return "world";
      default:
        return "world";
    }
  })();

  return (
    <a href={contributionLink.url} rel="noreferrer nonopener" target="_blank">
      <HStack className="items-start justify-between gap-2 mt-4">
        <HStack className="gap-3">
          <div className="mt-1">
            <Image src={icons[icon]} alt={icon} />
          </div>
          <p className="max-w-[300px] text-primary overflow-hidden text-ellipsis">
            {contributionLink.description}
          </p>
        </HStack>
        <ArrowTopRightOnSquareIcon className="mt-1 w-5 h-5 text-tertiary" />
      </HStack>
    </a>
  );
};

const ImpactMetric = ({
  impactMetric,
}: {
  impactMetric: {
    description: string;
    number: number;
    url: string;
  };
}) => {
  return (
    <li className="flex items-center justify-between gap-2 pt-4">
      <a href={impactMetric.url} rel="noreferrer nonopener" target="_blank">
        <div className="max-w-[300px] text-primary">
          {impactMetric.description}
        </div>
      </a>
      <div className="flex items-center gap-2">
        <div className="text-primary">
          {formatNumber(Number(impactMetric.number))}
        </div>
        <a
          href={impactMetric.url}
          rel="noreferrer nonopener"
          target="_blank"
          className="flex items-center gap-2"
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5 text-tertiary" />
        </a>
      </div>
    </li>
  );
};

function formatNumber(number: number) {
  const numberFormat = new Intl.NumberFormat("en", {
    style: "decimal",
    maximumSignificantDigits: 2,
    currencyDisplay: "code",
    compactDisplay: "short",
    notation: "compact",
  });

  const parts = numberFormat.formatToParts(number);
  return parts
    .filter((part) => part.type !== "currency" && part.type !== "literal")
    .map((part) => part.value)
    .join("");
}
