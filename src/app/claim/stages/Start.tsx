import React from "react";
import Image from "next/image";
import { Button } from "../../../components/ui/button";

const StartStage = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <div className="w-[700px] mx-auto space-y-4">
      <div className="w-full h-[525px] relative">
        <Image
          src="/images/scroll/scroll-welcome.png"
          alt="People around a circle of eth, yellow, blue, colorful"
          fill
        />
      </div>
      <h1 className="font-black text-[40px] text-center mt-[-48px]">
        Govern the Scroll Protocol
      </h1>
      <p className="text-center text-agora-stone-700">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu
        lectus dignissim, porta tortor nec.Lorem ipsum dolor sit amet,
        consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor
        nec.
      </p>
      <Button className="w-full">Connect</Button>
      <Button className="w-full" variant="secondary">
        Apply for organizational grant
      </Button>
    </div>
  );
};

export default StartStage;
