import React from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { Button } from "../../../components/ui/button";
import { useModal } from "connectkit";

const StartStage = ({ onSuccess }: { onSuccess: () => void }) => {
  const { address } = useAccount();
  const { setOpen } = useModal();
  return (
    <div className="w-[700px] mx-auto">
      <div className="w-full h-[425px] relative mt-4">
        <Image
          src="/images/scroll/scroll-welcome.png"
          alt="People around a circle of eth, yellow, blue, colorful"
          fill
        />
      </div>
      <h1 className="font-black text-[40px] text-center mt-4">
        Govern the Scroll Protocol
      </h1>
      <p className="text-center text-agora-stone-700 mt-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu
        lectus dignissim, porta tortor nec.Lorem ipsum dolor sit amet,
        consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor
        nec.
      </p>
      <Button
        className="w-full mt-4"
        onClick={() => {
          // try to connect wallet
          if (!address) {
            setOpen(true);
            return;
          }
          onSuccess();
        }}
      >
        {!!address ? "Next" : "Connect"}
      </Button>
      <Button className="w-full mt-4" variant="secondary">
        Apply for organizational grant
      </Button>
    </div>
  );
};

export default StartStage;
