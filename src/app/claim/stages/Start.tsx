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
      <div className="border rounded-2xl bg-neutral p-6 shadow-newDefault mt-4">
        <h1 className="text-primary font-black text-[56px] text-center">
          Govern the Scroll Protocol
        </h1>
        <p className="text-center text-secondary mt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu
          lectus dignissim, porta tortor nec.Lorem ipsum dolor sit amet,
          consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor
          nec.
        </p>
        <Button
          variant="brandPrimary"
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
          {!!address ? "Get started" : "Connect wallet"}
        </Button>
      </div>
    </div>
  );
};

export default StartStage;
