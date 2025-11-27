import { rgbStringToHex } from "@/app/lib/utils/color";
import { getScaledBarPercentage } from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/OptionResultsPanel/OptionResultsPanel";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { BRAND_NAME_MAPPINGS } from "@/lib/tenant/tenant";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TenantUI } from "@/lib/tenant/tenantUI";
import TenantUIFactory from "@/lib/tenant/tenantUIFactory";
import { ProposalType, TenantNamespace } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { ogLogoForShareVote } from "../assets/shared";

export const runtime = "nodejs";

// No access to tenant in edge runtime, so we need to create the tenantUI and tenantToken manually

// TailwindCSS is limited here so we sometimes use inline styles to achieve the same effect

// Can't use any external components here

function OptionsResultsPanel({
  options,
  totalOptions,
  namespace,
}: {
  options: {
    description: string;
    votes: bigint;
    votesAmountBN: bigint;
    totalVotingPower: bigint;
    proposalSettings: any;
    thresholdPosition: number;
    isApproved: boolean;
  }[];
  totalOptions: number;
  namespace: TenantNamespace;
}) {
  const tenantUI = TenantUIFactory.create(
    TENANT_NAMESPACES[namespace as keyof typeof TENANT_NAMESPACES]
  );
  const primary =
    tenantUI.theme === "dark"
      ? rgbStringToHex("0 0 0")
      : tenantUI.customization?.primary
        ? rgbStringToHex(tenantUI.customization?.primary)
        : rgbStringToHex("0 0 0");
  const wash =
    tenantUI.theme === "dark"
      ? rgbStringToHex("250 250 250")
      : tenantUI.customization?.wash
        ? rgbStringToHex(tenantUI.customization?.wash)
        : rgbStringToHex("250 250 250");

  return (
    <div tw={"flex flex-col flex-shrink px-4"}>
      {options.slice(0, 5).map((option, index) => {
        return (
          <SingleOption
            key={index}
            description={String(option.description)}
            votes={BigInt(option.votes)}
            votesAmountBN={BigInt(option.votesAmountBN)}
            totalVotingPower={BigInt(option.totalVotingPower)}
            proposalSettings={option.proposalSettings}
            thresholdPosition={Number(option.thresholdPosition)}
            isApproved={Boolean(option.isApproved)}
            namespace={namespace}
          />
        );
      })}
      {totalOptions > 5 && (
        <div
          style={{
            color: primary,
            backgroundColor: wash,
          }}
          tw="flex justify-center items-center rounded-lg p-2 w-24 ml-auto"
        >
          +{totalOptions - 5} more
        </div>
      )}
    </div>
  );
}

function SingleOption({
  description,
  votes,
  votesAmountBN,
  totalVotingPower,
  proposalSettings,
  thresholdPosition,
  isApproved,
  namespace,
}: {
  description: string;
  votes: bigint;
  votesAmountBN: bigint;
  totalVotingPower: bigint;
  proposalSettings: any;
  thresholdPosition: number;
  isApproved: boolean;
  namespace: TenantNamespace;
}) {
  let barPercentage = BigInt(0);
  const percentage =
    totalVotingPower === BigInt(0)
      ? BigInt(0)
      : (votesAmountBN * BigInt(10000)) / totalVotingPower; // mul by 10_000 to get 2 decimal places, divide by 100 later to use percentage

  if (proposalSettings.criteria === "TOP_CHOICES") {
    barPercentage = percentage;
  } else if (proposalSettings.criteria === "THRESHOLD") {
    const threshold = BigInt(proposalSettings.criteriaValue);
    barPercentage = getScaledBarPercentage({
      threshold,
      totalVotingPower,
      votesAmountBN,
      thresholdPosition,
    });
  }

  const barPercentageNumber = Number(barPercentage);

  const tenantUI = TenantUIFactory.create(
    TENANT_NAMESPACES[namespace as keyof typeof TENANT_NAMESPACES]
  );
  const tenantToken = TenantTokenFactory.create(
    TENANT_NAMESPACES[namespace as keyof typeof TENANT_NAMESPACES]
  );
  const primary =
    tenantUI.theme === "dark"
      ? rgbStringToHex("0 0 0")
      : tenantUI.customization?.primary
        ? rgbStringToHex(tenantUI.customization?.primary)
        : rgbStringToHex("0 0 0");
  const tertiary =
    tenantUI.theme === "dark"
      ? rgbStringToHex("115 115 115")
      : tenantUI.customization?.tertiary
        ? rgbStringToHex(tenantUI.customization?.tertiary)
        : rgbStringToHex("115 115 115");

  return (
    <div
      style={{
        gap: "4px",
      }}
      tw="flex flex-col last:mb-2"
    >
      {" "}
      <div tw="flex justify-between font-semibold text-sm mb-1">
        <div
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            color: primary,
          }}
          tw="flex max-w-[12rem]"
        >
          {description}
        </div>
        <div
          style={{
            gap: "4px",
            color: primary,
          }}
          tw="flex items-center"
        >
          <span
            style={{
              gap: "4px",
            }}
            tw={"flex items-center"}
          >
            {formatNumber(votes, tenantToken.decimals, 2, true)}
          </span>
          <span
            style={{
              color: tertiary,
            }}
            tw={"ml-1"}
          >
            {percentage === BigInt(0)
              ? "0%"
              : (Number(percentage) / 100).toFixed(2) + "%"}
          </span>
        </div>
      </div>
      <ProgressBar
        barPercentage={barPercentageNumber}
        isApproved={isApproved}
        thresholdPosition={thresholdPosition}
        namespace={namespace}
      />
    </div>
  );
}

function ProgressBar({
  barPercentage,
  isApproved,
  thresholdPosition,
  namespace,
}: {
  barPercentage: number;
  isApproved: boolean;
  thresholdPosition: number;
  namespace: TenantNamespace;
}) {
  const progressBarWidth =
    Math.max(
      Number(barPercentage) / 100,
      Number(barPercentage) !== 0 ? 1 : 0
    ).toFixed(2) + "%";

  const tenantUI = TenantUIFactory.create(
    TENANT_NAMESPACES[namespace as keyof typeof TENANT_NAMESPACES]
  );
  const positive = tenantUI.customization?.positive
    ? rgbStringToHex(tenantUI.customization?.positive)
    : rgbStringToHex("97 209 97");
  const tertiary = tenantUI.customization?.tertiary
    ? rgbStringToHex(tenantUI.customization?.tertiary)
    : rgbStringToHex("115 115 115");
  const secondary = tenantUI.customization?.secondary
    ? rgbStringToHex(tenantUI.customization?.secondary)
    : rgbStringToHex("64 64 64");
  const line = tenantUI.customization?.line
    ? rgbStringToHex(tenantUI.customization?.line)
    : rgbStringToHex("229 229 229");

  return (
    <div tw="flex">
      {" "}
      <div
        style={{
          backgroundColor: line,
        }}
        tw="flex w-full h-[6px] rounded-[10px] relative mb-3"
      >
        <div
          style={{
            backgroundColor: isApproved ? positive : tertiary,
            width: progressBarWidth,
          }}
          tw={`flex h-[6px] absolute rounded-[10px] top-0 right-0`}
        ></div>
        {!!thresholdPosition && (
          <div
            tw={`flex w-[2px] h-[6px] absolute top-0 rounded-[10px]`}
            style={{
              right: `${thresholdPosition}%`,
              backgroundColor: secondary,
            }}
          />
        )}
      </div>
    </div>
  );
}

const deriveBrandName = (namespace: TenantNamespace): string => {
  if (namespace.toLowerCase() in BRAND_NAME_MAPPINGS) {
    return BRAND_NAME_MAPPINGS[namespace.toLowerCase()];
  }
  return namespace.charAt(0).toUpperCase() + namespace.slice(1).toLowerCase();
};

function generateVoteBars(
  forPercentage: number,
  againstPercentage: number,
  namespace: TenantNamespace,
  proposalType: ProposalType,
  supportType: "FOR" | "AGAINST" | "ABSTAIN"
) {
  const tenantUI: TenantUI = TenantUIFactory.create(
    TENANT_NAMESPACES[namespace as keyof typeof TENANT_NAMESPACES]
  );
  const totalBars = 71;
  const bars = [];
  const totalVotes = forPercentage + againstPercentage;

  const positiveColor = tenantUI.customization?.positive
    ? rgbStringToHex(tenantUI.customization?.positive)
    : rgbStringToHex("97 209 97");
  const abstainColor = tenantUI.customization?.tertiary
    ? rgbStringToHex(tenantUI.customization?.tertiary)
    : rgbStringToHex("115 115 115");
  const againstColor = tenantUI.customization?.negative
    ? rgbStringToHex(tenantUI.customization?.negative)
    : rgbStringToHex("226 54 54");

  const className = "flex h-7 w-[5px] rounded-full shrink-0";

  if (totalVotes === 0) {
    // If no votes, show all bars as user's vote
    for (let i = 0; i < totalBars; i++) {
      bars.push(
        <div
          key={`${supportType}-${i}`}
          style={{
            backgroundColor:
              supportType === "FOR"
                ? positiveColor
                : supportType === "AGAINST"
                  ? againstColor
                  : abstainColor,
          }}
          tw={className}
        />
      );
    }
  } else {
    const forBars =
      proposalType === "OPTIMISTIC" ||
      proposalType === "OFFCHAIN_OPTIMISTIC" ||
      proposalType === "OFFCHAIN_OPTIMISTIC_TIERED"
        ? 0
        : Math.round((totalBars * forPercentage) / 100);
    const againstBars = Math.round((totalBars * againstPercentage) / 100);
    const abstainBars = totalBars - forBars - againstBars;

    // Generate FOR bars
    for (let i = 0; i < forBars; i++) {
      bars.push(
        <div
          key={`for-${i}`}
          style={{ backgroundColor: positiveColor }}
          tw={className}
        />
      );
    }

    // Generate abstain bars
    for (let i = 0; i < abstainBars; i++) {
      bars.push(
        <div
          key={`abstain-${i}`}
          style={{ backgroundColor: abstainColor }}
          tw={className}
        />
      );
    }

    // Generate AGAINST bars
    for (let i = 0; i < againstBars; i++) {
      bars.push(
        <div
          key={`against-${i}`}
          style={{ backgroundColor: againstColor }}
          tw={className}
        />
      );
    }
  }

  return (
    <div
      tw="flex items-center justify-center w-full"
      style={{
        gap: "10px",
      }}
    >
      {bars}
    </div>
  );
}

const SuccessMessageCard = ({
  namespace,
  forPercentage,
  againstPercentage,
  blockNumber,
  endsIn,
  voteDate,
  supportType,
  proposalType,
  options,
  totalOptions,
}: {
  namespace: TenantNamespace;
  forPercentage: number;
  againstPercentage: number;
  blockNumber: string | null;
  endsIn: string | null;
  voteDate: string | null;
  supportType: "FOR" | "AGAINST" | "ABSTAIN";
  proposalType: ProposalType;
  options: {
    description: string;
    votes: bigint;
    votesAmountBN: bigint;
    totalVotingPower: bigint;
    proposalSettings: any;
    thresholdPosition: number;
    isApproved: boolean;
  }[];
  totalOptions: number;
}) => {
  const tenantUI: TenantUI = TenantUIFactory.create(
    TENANT_NAMESPACES[namespace as keyof typeof TENANT_NAMESPACES]
  );
  const positive = tenantUI.customization?.positive
    ? rgbStringToHex(tenantUI.customization?.positive)
    : rgbStringToHex("97 209 97");
  const primary =
    tenantUI.theme === "dark"
      ? rgbStringToHex("0 0 0")
      : tenantUI.customization?.primary
        ? rgbStringToHex(tenantUI.customization?.primary)
        : rgbStringToHex("0 0 0");
  const secondary =
    tenantUI.theme === "dark"
      ? rgbStringToHex("115 115 115")
      : tenantUI.customization?.secondary
        ? rgbStringToHex(tenantUI.customization?.secondary)
        : rgbStringToHex("64 64 64");
  const line = tenantUI.customization?.line
    ? rgbStringToHex(tenantUI.customization?.line)
    : rgbStringToHex("229 229 229");
  const negative = tenantUI.customization?.negative
    ? rgbStringToHex(tenantUI.customization?.negative)
    : rgbStringToHex("226 54 54");

  return (
    <div tw="h-full w-full flex flex-col p-8 relative rounded-lg">
      {/* Main Content Container */}
      <div tw="flex flex-col justify-between w-full h-full">
        <div tw="flex flex-col">
          {/* Header Section */}
          <div tw="flex justify-between items-start w-full">
            <div
              tw="flex flex-col"
              style={{
                gap: "8px",
                fontSize: proposalType !== "APPROVAL" ? "54px" : "44px",
              }}
            >
              <div tw="flex items-center" style={{ gap: "8px" }}>
                <span
                  style={{
                    color: primary,
                  }}
                  tw="font-bold"
                >
                  I voted
                </span>
                <span
                  style={{
                    color:
                      supportType === "FOR"
                        ? positive
                        : supportType === "AGAINST"
                          ? negative
                          : secondary,
                  }}
                  tw="font-bold"
                >
                  {supportType}
                </span>
              </div>
              <span
                style={{
                  color: primary,
                  fontSize: proposalType !== "APPROVAL" ? "40px" : "32px",
                }}
                tw="font-normal"
              >
                on a proposal on {deriveBrandName(namespace)} Agora
              </span>
            </div>

            {/* Tenant Logo */}
            <div
              tw="flex"
              style={{
                transform:
                  proposalType !== "APPROVAL" ? "scale(2)" : "scale(1.75)",
                transformOrigin: "top right",
                marginTop: "-10px",
              }}
            >
              {ogLogoForShareVote(namespace)}
            </div>
          </div>

          {/* Vote Stats Section */}
          <div
            style={{
              borderColor: line,
              marginTop: proposalType !== "APPROVAL" ? "88px" : "40px",
            }}
            tw="flex flex-col bg-white rounded-lg border"
          >
            {proposalType === "APPROVAL" ? (
              <div tw="py-2 flex">
                <OptionsResultsPanel
                  options={options}
                  totalOptions={totalOptions}
                  namespace={namespace}
                />
              </div>
            ) : (
              <div tw="flex flex-col p-9" style={{ gap: "8px" }}>
                <div tw="flex justify-between w-full text-3xl font-semibold">
                  <span
                    style={{
                      color: positive,
                    }}
                  >
                    {proposalType === "STANDARD" ? "FOR" : ""}
                  </span>
                  <span
                    style={{
                      color: negative,
                    }}
                  >
                    AGAINST
                  </span>
                </div>

                {/* Progress Bar */}
                <div tw="w-full relative flex mt-4">
                  {generateVoteBars(
                    forPercentage,
                    againstPercentage,
                    namespace,
                    proposalType,
                    supportType
                  )}
                </div>
              </div>
            )}

            {/* Transaction Info */}
            <div
              style={{
                borderColor: line,
                color: primary,
                fontSize: proposalType !== "APPROVAL" ? "24px" : "18px",
              }}
              tw="flex justify-between items-center bg-[#fafafa] border-t border-b rounded-b-lg font-semibold py-4 px-6"
            >
              <div tw="flex items-center">
                <span style={{ gap: "8px" }} tw="flex items-center">
                  {/* Block Icon */}
                  <div
                    tw="flex"
                    style={{
                      width: "30px",
                      height: "30px",
                    }}
                  >
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 18 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clip-path="url(#clip0_4168_3248)">
                        <path
                          d="M14.7598 6.01282L9.25302 2.86608C9.13261 2.79724 8.98475 2.79724 8.86432 2.86608L3.35753 6.01282C3.23547 6.08254 3.16016 6.21236 3.16016 6.3529V12.6464C3.16016 12.7869 3.23547 12.9167 3.35753 12.9865L8.86432 16.1332C8.92454 16.1676 8.9916 16.1848 9.05866 16.1848C9.12572 16.1848 9.1928 16.1676 9.253 16.1332L14.7598 12.9865C14.8818 12.9167 14.9572 12.7869 14.9572 12.6464V6.3529C14.9572 6.21233 14.8818 6.08254 14.7598 6.01282ZM9.05866 3.65733L13.7759 6.3529L9.05866 9.04849L4.3414 6.3529L9.05866 3.65733ZM3.94358 7.0279L8.66695 9.72696V15.1181L3.94358 12.4191V7.0279ZM9.45037 15.1181V9.72696L14.1737 7.0279V12.4191L9.45037 15.1181Z"
                          fill="#011A25"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_4168_3248">
                          <rect
                            width="13.3704"
                            height="13.3704"
                            fill="white"
                            transform="translate(2.375 2.81445)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  {blockNumber} · {voteDate}
                </span>
              </div>
              <span>{endsIn}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div tw="flex justify-end items-center">
          <div
            tw="flex"
            style={{
              width: "155px",
              height: "40px",
            }}
          >
            {/* Agora Logo */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 62 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_4184_3154)">
                <path
                  d="M5.10709 5.75415C5.02664 8.01689 5.05996 10.2886 5.1079 12.4059C5.13634 13.3578 5.80672 13.9199 6.90127 13.906H7.01584C7.02803 13.906 7.03941 13.906 7.0516 13.906C8.12582 13.906 8.78157 13.3473 8.81001 12.4051C8.85877 10.304 8.89209 8.0437 8.81083 5.75415C8.7767 4.70238 7.83167 4.32796 6.95896 4.32715C6.08706 4.32715 5.14284 4.70238 5.10709 5.75334V5.75415Z"
                  fill="#171717"
                />
                <path
                  d="M1.69911 4.02735H0.548496C0.348601 4.02653 0.185272 4.18897 0.185272 4.38958V13.8442C0.185272 14.044 0.347789 14.2073 0.548496 14.2073H1.69911C2.82779 14.2073 3.746 13.2895 3.746 12.1614V6.07405C3.746 4.94593 2.82779 4.02816 1.69911 4.02816V4.02735Z"
                  fill="#171717"
                />
                <path
                  d="M13.5214 -0.0410156H0.363224C0.162516 -0.0410156 0 0.121421 0 0.32203V1.15939C0 2.28751 0.918218 3.20528 2.04689 3.20528H3.80451C3.81182 3.20447 3.8232 3.20447 3.83945 3.20447C3.8492 3.20447 3.8622 3.20447 3.87764 3.20365H3.88252H3.88739C3.91664 3.20528 3.94671 3.20528 3.97678 3.20528C3.98896 3.20528 4.00684 3.20528 4.02716 3.20447H4.11248C4.12792 3.20528 4.14823 3.20528 4.17423 3.20365H4.17911H4.18398C4.20755 3.20447 4.2303 3.20528 4.25387 3.20447C4.26687 3.20447 4.28312 3.20447 4.30425 3.20284H4.30912H4.314C4.34488 3.20365 4.36844 3.20447 4.39526 3.20447C4.40582 3.20447 4.4172 3.20447 4.43182 3.20365H4.4367H4.44157C4.47083 3.20528 4.50008 3.20528 4.53096 3.20528C4.54477 3.20528 4.56102 3.20528 4.58052 3.20365H4.5854H4.59028C4.61628 3.20447 4.64391 3.20609 4.67072 3.20528C4.6886 3.20528 4.70891 3.20528 4.73329 3.20365H4.73817H4.74385C4.76417 3.20447 4.78611 3.20365 4.80561 3.20447C4.81861 3.20447 4.83324 3.20447 4.84949 3.20365H4.85274H4.85843C4.88849 3.20447 4.91612 3.20528 4.94537 3.20528C4.95919 3.20528 4.97544 3.20528 4.9925 3.20365H4.99738H5.00225C5.02826 3.20447 5.05507 3.20528 5.08107 3.20528C5.09976 3.20528 5.12089 3.20528 5.14608 3.20365H5.15096H5.15583C5.17615 3.20447 5.19727 3.20365 5.21759 3.20447C5.23221 3.20447 5.2509 3.20447 5.27122 3.20284H5.27609H5.28178C5.31185 3.20365 5.33298 3.20365 5.35492 3.20447C5.36792 3.20447 5.38336 3.20447 5.40042 3.20365C5.43861 3.20447 5.46786 3.20528 5.4963 3.20528C5.51093 3.20528 5.52718 3.20528 5.54506 3.20365H5.55075H5.55644C5.58244 3.20447 5.60682 3.20528 5.63282 3.20528C5.64744 3.20528 5.6637 3.20528 5.68157 3.20365H5.68645H5.69132C5.71814 3.20447 5.74414 3.20528 5.76933 3.20528C5.78802 3.20528 5.81077 3.20528 5.83353 3.20365H5.8384H5.84328C5.86359 3.20447 5.88472 3.20528 5.90422 3.20447C5.91885 3.20447 5.93429 3.20447 5.95216 3.20365H5.95704H5.96191C5.99035 3.20528 6.01554 3.20528 6.04155 3.20528C6.06267 3.20528 6.08705 3.20528 6.11224 3.20365H6.11712H6.12199C6.14149 3.20447 6.161 3.20528 6.17887 3.20447C6.19594 3.20447 6.21625 3.20447 6.23738 3.20284H6.24225H6.24713C6.27801 3.20365 6.29832 3.20447 6.32107 3.20447C6.3357 3.20447 6.35114 3.20447 6.3682 3.20365H6.37308H6.37796C6.40477 3.20528 6.43159 3.20609 6.45596 3.20528C6.47465 3.20528 6.49497 3.20528 6.51772 3.20365H6.52259H6.52747C6.55429 3.20447 6.57704 3.20528 6.59817 3.20528C6.61767 3.20528 6.63636 3.20528 6.65748 3.20365H6.66236H6.66723C6.69405 3.20447 6.71599 3.20528 6.73712 3.20528C6.75499 3.20528 6.77368 3.20528 6.794 3.20365H6.79887H6.80375C6.83056 3.20447 6.8525 3.20528 6.87444 3.20528C6.89313 3.20528 6.91182 3.20528 6.93214 3.20365H6.93701H6.94189C6.96952 3.20447 6.99064 3.20528 7.01339 3.20528C7.03533 3.20528 7.05809 3.20528 7.08084 3.20365H7.14503C7.16535 3.20447 7.18566 3.20447 7.2076 3.20284H7.21248H7.21735C7.24823 3.20365 7.26773 3.20447 7.28886 3.20447C7.30674 3.20447 7.32705 3.20447 7.34655 3.20284H7.35143H7.36606C7.38718 3.20365 7.40587 3.20447 7.42456 3.20447C7.44163 3.20447 7.45869 3.20447 7.47738 3.20365H7.48225H7.49119C7.51557 3.20528 7.53832 3.20528 7.56026 3.20528C7.58139 3.20528 7.60414 3.20528 7.62689 3.20365H7.63177H7.63665C7.66021 3.20447 7.68296 3.20528 7.70328 3.20528C7.72359 3.20528 7.74309 3.20528 7.76341 3.20365H7.76828H7.77316C7.8016 3.20447 7.82029 3.20609 7.83817 3.20528C7.85523 3.20528 7.87554 3.20528 7.89342 3.20447H7.8983H7.90317C7.92755 3.20609 7.95111 3.20609 7.97224 3.20609C8.00231 3.20609 8.03319 3.20528 8.06569 3.20284H8.11038C8.13394 3.20284 8.1567 3.20284 8.18108 3.20122H8.18595H8.19083C8.2152 3.20203 8.2347 3.20284 8.25258 3.20284C8.27371 3.20284 8.29484 3.20284 8.31759 3.20122H8.32246H8.32734C8.35172 3.20203 8.37122 3.20284 8.3891 3.20284C8.4086 3.20284 8.42891 3.20284 8.45004 3.20203H8.45492H8.45979C8.48417 3.20365 8.5053 3.20284 8.5248 3.20365C8.54674 3.20365 8.56949 3.20365 8.59224 3.20203H8.59712H8.60281C8.628 3.20284 8.6475 3.20365 8.66537 3.20365C8.68731 3.20365 8.71007 3.20365 8.73282 3.20203H8.73769H8.74257C8.77182 3.20284 8.78807 3.20365 8.80514 3.20365C8.82708 3.20365 8.85064 3.20365 8.87339 3.20203H8.87827H8.88315C8.90996 3.20284 8.92784 3.20447 8.94328 3.20365C8.96522 3.20365 8.98797 3.20365 9.01072 3.20203H9.0156H9.03104C9.04972 3.20203 9.06516 3.20284 9.07979 3.20365C9.10661 3.20365 9.13342 3.20365 9.16105 3.20203H9.16592H9.1708C9.18624 3.20203 9.20005 3.20203 9.21387 3.20203C9.23824 3.20203 9.26425 3.20203 9.28944 3.20041H9.29431H9.29919C9.32519 3.20122 9.34225 3.20284 9.35688 3.20203C9.38045 3.20203 9.40482 3.20203 9.43001 3.20041H9.43489H9.45033C9.46658 3.20041 9.47958 3.20203 9.49258 3.20203C9.5129 3.20203 9.53484 3.20203 9.55596 3.20122H9.56084H9.56571C9.5909 3.20284 9.61122 3.20365 9.62828 3.20284C9.65429 3.20284 9.67948 3.20284 9.7071 3.20122H9.71198H9.72661C9.74529 3.20122 9.75992 3.20284 9.77211 3.20284C9.79649 3.20284 9.82005 3.20284 9.84524 3.20122H9.85012H9.86881C9.88587 3.20122 9.89887 3.20284 9.90944 3.20203C9.93706 3.20203 9.96632 3.20203 9.99395 3.20041H9.99882H10.0037C10.0199 3.20122 10.0354 3.20203 10.0459 3.20122C10.0671 3.20122 10.0898 3.20122 10.1118 3.20041L10.2003 3.19716V3.20284L11.8385 3.20447C12.9672 3.20447 13.8854 2.2867 13.8854 1.15858V0.32203C13.8854 0.122233 13.7229 -0.0410156 13.5222 -0.0410156H13.5214Z"
                  fill="#171717"
                />
                <path
                  d="M13.371 4.02637H12.2204C11.0917 4.02637 10.1735 4.94413 10.1735 6.07226V12.1596C10.1735 13.2877 11.0917 14.2054 12.2204 14.2054H13.371C13.5709 14.2054 13.7343 14.043 13.7343 13.8424V4.38941C13.7343 4.18962 13.5717 4.02637 13.371 4.02637Z"
                  fill="#171717"
                />
                <path
                  d="M25.8222 5.79294V11.9143H23.2862V10.8252C22.7604 11.6512 21.8958 12.1393 20.7127 12.1393C19.2663 12.1393 17.5566 11.0875 17.5566 9.05952C17.5566 7.03152 19.2102 5.96106 20.7127 5.96106C21.8585 5.96106 22.7044 6.41182 23.2301 7.18177V4.96614C23.2301 4.21487 22.8734 3.68939 21.9901 3.68939C21.1068 3.68939 20.694 4.21487 20.694 5.22928H17.876C17.876 3.89568 18.778 2.67578 21.9714 2.67578C24.9398 2.67578 25.823 3.80228 25.823 5.79294H25.8222ZM23.2675 9.04165C23.2675 7.98989 22.4785 7.42705 21.6707 7.42705C20.863 7.42705 20.0366 7.99071 20.0366 9.04165C20.0366 10.0926 20.8257 10.6563 21.6707 10.6563C22.5158 10.6563 23.2675 10.0926 23.2675 9.04165Z"
                  fill="#171717"
                />
                <path
                  d="M36.8506 1.93055C36.8628 1.94435 36.8693 1.96222 36.8693 1.9809L36.8514 3.95532C36.8514 4.0276 36.8173 4.09501 36.7604 4.13968C36.7116 4.17786 36.6458 4.18679 36.5873 4.1673C36.3622 4.09339 36.1022 4.05034 35.8552 4.05034C35.4416 4.05034 35.0662 4.16324 34.7655 4.36953C35.0288 4.80161 35.1604 5.30842 35.1604 5.90943C35.1604 8.01217 33.4321 9.06396 30.9708 9.06396H29.656C29.1303 9.06396 28.867 9.38315 28.867 9.66498C28.867 10.0028 29.1116 10.2286 29.5999 10.2286H32.8503C34.6729 10.2286 35.8747 11.1675 35.8747 12.6506C35.8747 14.7915 33.6393 15.9553 30.4832 15.9553C28.1348 15.9553 26.3878 15.2796 26.3878 13.89C26.3878 13.1013 27.102 12.4629 28.2291 12.1624C27.2524 11.918 26.7071 11.3365 26.7071 10.491C26.7071 9.58945 27.4962 8.76346 28.5858 8.48163C27.6839 7.97481 27.1207 7.11065 27.1207 5.90943C27.1207 3.80669 28.8678 2.75491 31.1601 2.75491C32.3245 2.75491 33.3581 3.03674 34.0911 3.5809C34.4478 2.62334 35.3311 1.87207 36.4394 1.87207C36.5865 1.87207 36.745 1.89481 36.8067 1.90456C36.8238 1.90699 36.8392 1.91593 36.8514 1.92974L36.8506 1.93055ZM29.5235 12.3509C29.1855 12.5198 28.6216 12.8763 28.6216 13.5529C28.6216 14.3789 29.4667 14.8865 30.8383 14.8865C32.5106 14.8865 33.6003 14.2855 33.6003 13.384C33.6003 12.6895 33.0363 12.3509 31.8532 12.3509H29.5235ZM32.6227 5.91024C32.6227 4.50192 32.1157 3.76933 31.1576 3.76933C30.1996 3.76933 29.6544 4.50192 29.6544 5.91024C29.6544 7.31857 30.1614 8.05116 31.1576 8.05116C32.1539 8.05116 32.6227 7.29989 32.6227 5.91024Z"
                  fill="#171717"
                />
                <path
                  d="M36.8368 7.40756C36.8368 4.25304 38.9406 2.67578 41.7025 2.67578C44.4645 2.67578 46.5683 4.25304 46.5683 7.40756C46.5683 10.5621 44.4645 12.1393 41.7025 12.1393C38.9406 12.1393 36.8368 10.5621 36.8368 7.40756ZM43.7128 7.40756C43.7128 4.87274 42.9238 3.7836 41.7025 3.7836C40.4812 3.7836 39.6922 4.89142 39.6922 7.40756C39.6922 9.92368 40.4625 11.0315 41.7025 11.0315C42.9425 11.0315 43.7128 9.92368 43.7128 7.40756Z"
                  fill="#171717"
                />
                <path
                  d="M47.5889 11.9143V2.90157H50.0876V5.09852C50.5759 3.44573 51.6095 2.67578 53.0559 2.67578C53.1282 2.67578 53.1875 2.73507 53.1875 2.80736V5.30482C52.8495 5.19192 52.4928 5.1172 52.0605 5.1172C51.1585 5.1172 50.1444 5.7369 50.1444 7.23944V11.9152H47.5889V11.9143Z"
                  fill="#171717"
                />
                <path
                  d="M61.9854 5.79294V11.9143H59.4493V10.8252C58.9236 11.6512 58.059 12.1393 56.8759 12.1393C55.4295 12.1393 53.7198 11.0875 53.7198 9.05952C53.7198 7.03152 55.3734 5.96106 56.8759 5.96106C58.0216 5.96106 58.8675 6.41182 59.3932 7.18177V4.96614C59.3932 4.21487 59.0365 3.68939 58.1532 3.68939C57.27 3.68939 56.8572 4.21487 56.8572 5.22928H54.0391C54.0391 3.89568 54.9411 2.67578 58.1345 2.67578C61.1029 2.67578 61.9862 3.80228 61.9862 5.79294H61.9854ZM59.4306 9.04165C59.4306 7.98989 58.6416 7.42705 57.8339 7.42705C57.0262 7.42705 56.1998 7.99071 56.1998 9.04165C56.1998 10.0926 56.9888 10.6563 57.8339 10.6563C58.679 10.6563 59.4306 10.0926 59.4306 9.04165Z"
                  fill="#171717"
                />
              </g>
              <defs>
                <clipPath id="clip0_4184_3154">
                  <rect width="143" height="36" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const namespace = searchParams.get("namespace") as TenantNamespace;
  const forPercentage = Number(searchParams.get("forPercentage"));
  const againstPercentage = Number(searchParams.get("againstPercentage"));
  const blockNumber = searchParams.get("blockNumber");
  const endsIn = searchParams.get("endsIn");
  const voteDate = searchParams.get("voteDate");
  const options = JSON.parse(searchParams.get("options") || "[]");
  const totalOptions = Number(searchParams.get("totalOptions"));
  const proposalType = searchParams.get("proposalType") as ProposalType;
  const supportType = searchParams.get("supportType") as
    | "FOR"
    | "AGAINST"
    | "ABSTAIN";

  const bgData = await fetch(new URL(`${origin}/images/grid-share.png`)).then(
    (res) => res.arrayBuffer()
  );

  const interBoldFont = await fetch(
    new URL(`${origin}/fonts/Inter/Inter-Bold.ttf`)
  ).then((res) => res.arrayBuffer());

  const interRegularFont = await fetch(
    new URL(`${origin}/fonts/Inter/Inter-Regular.ttf`)
  ).then((res) => res.arrayBuffer());

  const interSemiBoldFont = await fetch(
    new URL(`${origin}/fonts/Inter/Inter-SemiBold.ttf`)
  ).then((res) => res.arrayBuffer());

  const bgBase64 = `data:image/png;base64,${Buffer.from(bgData).toString("base64")}`;

  try {
    return new ImageResponse(
      (
        <div
          tw="flex flex-col w-full h-full"
          style={{
            fontFamily: '"Inter"',
            backgroundColor: "#F3F3EF",
            backgroundImage: `url(${bgBase64})`,
            textRendering: "geometricPrecision",
            shapeRendering: "crispEdges",
          }}
        >
          <SuccessMessageCard
            namespace={namespace}
            forPercentage={forPercentage}
            againstPercentage={againstPercentage}
            blockNumber={blockNumber}
            endsIn={endsIn}
            voteDate={voteDate}
            supportType={supportType}
            proposalType={proposalType}
            options={options}
            totalOptions={totalOptions}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
        fonts: [
          {
            data: interBoldFont,
            name: "Inter",
            style: "normal",
            weight: 700,
          },
          {
            data: interRegularFont,
            name: "Inter",
            style: "normal",
            weight: 400,
          },
          {
            data: interSemiBoldFont,
            name: "Inter",
            style: "normal",
            weight: 600,
          },
        ],
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    });
  }
}
