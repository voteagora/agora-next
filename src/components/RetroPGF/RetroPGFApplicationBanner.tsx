import { HStack, VStack } from "@/components/Layout/Stack";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { type RetroPGFProject } from "@/lib/types";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import Image from "next/image";
import projectPlaceholder from "@/icons/projectPlaceholder.svg";
import ENSName from "@/components/shared/ENSName";

function extractWebsiteName(urlString: string): string {
  try {
    const url = new URL(urlString);
    return url.hostname;
  } catch (error) {
    console.error("Invalid URL:", error);
    return "Unknown";
  }
}

export default function RetroPGFApplicationBanner({
  retroPGFProject,
}: {
  retroPGFProject: RetroPGFProject;
}) {
  const {
    applicant,
    applicantType,
    bio,
    displayName,
    impactCategory,
    includedInBallots,
    websiteUrl,
    profile,
  } = retroPGFProject;

  return (
    <div className="flex flex-col sm:flex-row items-center w-full max-w-6xl pb-8 px-4">
      <div className="h-[640px] sm:h-[400px] box-border rounded-lg bg-neutral border border-line shadow-newDefault relative overlofw-hidden w-full my-0 mx-auto pb-[80px]">
        <div className="absolute top-6 left-6">
          <HStack className="gap-2 flex-wrap">
            {impactCategory.map((category) => (
              <CategoryListItem key={category} category={category} />
            ))}
          </HStack>
        </div>
        <div
          className={cn(
            "relative overflow-hidden h-[300px] w-full rounded-2xl border-8 border-white bg-wash bg-cover bg-center"
          )}
          style={{
            backgroundImage: `url(${
              profile?.bannerImageUrl
                ? profile.bannerImageUrl
                : (profile?.profileImageUrl ?? "")
            })`,
            filter: `blur(${profile?.bannerImageUrl ? "0px" : "40px"})`,
          }}
        />
        <Image
          src={profile?.profileImageUrl || projectPlaceholder}
          alt={`${displayName} icon`}
          className={cn(
            "absolute top-[200px] sm:top-[258px] left-[50%] sm:left-[20px] -translate-x-1/2 sm:translate-x-0",
            "b-[calc(0%+20px)] z-20 border-[6px] border-white  rounded-2xl bg-neutral shadow-newDefault"
          )}
          height="120"
          width="120"
        />
        <div className="absolute flex flex-col sm:flex-row items-center justify-between top-[316px] sm:top-auto bottom-auto sm:bottom-0 left-0 sm:left-[144px] w-full sm:w-[calc(100%-144px)] py-0 px-3 sm:pl-6 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full">
            <VStack className="w-full">
              <div className="gap-3 items-center flex flex-col sm:flex-row mt-4 sm:mt-auto">
                <h3 className="font-bold text-2xl text-center sm:text-left">
                  {displayName}
                </h3>
                <HStack className="gap-2 justify-center sm:justify-start mb-4 sm:mb-auto flex-wrap text-sm text-secondary">
                  <p className="bg-wash py-0 px-3 rounded-[24px]">
                    {capitalizeFirstLetter(applicantType)}
                  </p>
                  <div className="bg-wash py-0 px-3 rounded-[24px]">
                    <ENSName address={applicant.address.address} />
                  </div>
                  <div className="bg-wash py-0 px-3 rounded-[24px]">
                    <a href={websiteUrl} rel="noreferrer" target="_blank">
                      <HStack>
                        {extractWebsiteName(websiteUrl)}
                        <ArrowTopRightOnSquareIcon className="w-6 h-6 text-tertiary block pl-1.5" />
                      </HStack>
                    </a>
                  </div>
                </HStack>
              </div>

              <p className="font-inter text-center sm:text-left font-medium text-base leading-6 text-secondary">
                {bio}
              </p>
            </VStack>
            <HStack className="gap-2">
              <VStack className="mr-4 mt-5 items-end">
                <div className="text-sm text-secondary whitespace-nowrap texr-right">
                  Appears in
                </div>
                <div className="text-sm text-primary whitespace-nowrap texr-right">
                  {includedInBallots} ballots
                </div>
              </VStack>
            </HStack>
          </div>
        </div>
      </div>
    </div>
  );
}

type CategoryListItemProps = {
  category: string;
};

const CategoryListItem = ({ category }: CategoryListItemProps) => {
  return (
    <div
      key={category}
      className="text-sm bg-neutral bg-opacity-90 rounded-xl text-secondary leading-relaxed py-0 px-3 shadow-newDefault capitalize z-10"
    >
      {formatCategory(category)}
    </div>
  );
};

function formatCategory(category: string) {
  switch (category) {
    case "OP_STACK":
      return "OP Stack";
    case "END_USER_EXPERIENCE_AND_ADOPTION":
      return "End User Experience & Adoption";
    default:
      return category
        .split("_")
        .map((it) => it.charAt(0).toUpperCase() + it.slice(1).toLowerCase())
        .join(" ");
  }
}
