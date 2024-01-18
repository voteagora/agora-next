import { VStack } from "@/components/Layout/Stack";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import cogwheel from "@/assets/optimism/cogwheel.svg";
import star from "@/assets/optimism/star.svg";
import hourglass from "@/assets/optimism/hourglass.svg";

export default function CastProposalDialogLoading() {
  return (
    <VStack className="gap-2">
      {/* TODO: frh -> style this */}
      <div className="width-full h-[155px] bg-gray-200">
        <Image src={cogwheel} alt="Creating your proposal ..." />
        <Image src={star} alt="Creating your proposal ..." />
        <Image src={hourglass} alt="Creating your proposal ..." />
      </div>
      <span className="font-black text-black text-2xl">
        Creating your proposal ...
      </span>
      <span className="font-medum text-base text-gray-4f">
        It might take up to a minute for the changes to be reflected.
      </span>
      <Button variant="disabled">Writing your proposal to chain...</Button>
    </VStack>
  );
}
