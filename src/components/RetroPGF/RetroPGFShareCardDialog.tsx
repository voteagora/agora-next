import { HStack, VStack } from "@/components/Layout/Stack";
import shareCard from "@/icons/shareCard.svg";
import projectPlaceholder from "@/icons/projectPlaceholder.svg";
import Image from "next/image";
import Link from "next/link";

function parseProjectId(projectId: string) {
  return projectId.split("|")[1];
}

function formatNumber(number: number) {
  const numberFormat = new Intl.NumberFormat("en", {
    style: "decimal",
    useGrouping: true,
  });

  const parts = numberFormat.formatToParts(number);
  return parts
    .filter((part) => part.type !== "currency" && part.type !== "literal")
    .map((part) => part.value)
    .join("");
}

export default function RetroPGFShareCardDialog({
  awarded,
  displayName,
  id,
  profileImageUrl,
  closeDialog,
}: {
  awarded: string;
  displayName: string;
  id: string;
  profileImageUrl: string | null;
  closeDialog: () => void;
}) {
  return (
    <VStack className="items-center justify-center p-8 h-full relative">
      <Link
        onClick={closeDialog}
        href={`/retropgf/3/application/${parseProjectId(id)}`}
        className="p-8 relative flex w-[320px] sm:w-[800px] bottom-[20vh]"
      >
        <Image
          src={shareCard}
          alt="Background"
          className="absolute w-full top-0 left-0 z-10 rounded-2xl shadow-newDefault"
        />
        <Image
          src="/rpgf/overlay.png"
          alt="Overlay"
          width="200"
          height="200"
          className="absolute z-50 w-[80px] sm:w-[200px] top-[92px] sm:top-[230px] left-[13px] sm:left-[32px] rounded-[50%]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profileImageUrl || projectPlaceholder}
          alt={displayName}
          className="absolute w-[72px] sm:w-[180px] top-[96px] sm:top-[240px] left-[17px] sm:left-[44px] z-20 rounded-[50%]"
        />
        <HStack className="absolute justify-between w-full top-[200px] sm:top-[475px] left-0 bg-red-100 z-50 p-4 rounded-2xl shadow-newDefault">
          <div className="text-red-600">View project application</div>
          <div className="text-red-200">→</div>
        </HStack>
        <VStack className="absolute z-20 top-[270px] left-[250px]">
          <h3 className="text-2xl hidden sm:block">{displayName} received:</h3>
          <HStack className="gap-2 hidden sm:inline-flex text-6xl">
            <h1 className="font-bold text-primary">
              {formatNumber(Number(awarded))}
            </h1>
            <h1 className="text-red-600 font-bold">OP</h1>
          </HStack>
        </VStack>
      </Link>
    </VStack>
  );
}
