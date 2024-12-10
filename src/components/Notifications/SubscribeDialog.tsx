"use client";

import { useState } from "react";
import StarIcon from "./DialogImage/Star";
import EnvelopeBottom from "./DialogImage/EnvelopeBottom";
import EnvelopeTop from "./DialogImage/EnvelopeTop";
import EnvelopePaper from "./DialogImage/EnvelopePaper";
import { Button } from "../ui/button";

const SubscribeDialog = () => {
  const [isHovering, setIsHovering] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-2 bg-tertiary/5 rounded-lg relative overflow-y-hidden">
        <div className="absolute w-full h-full bg-[url('/images/grid.svg')]"></div>
        <StarIcon
          className={`text-brandPrimary absolute top-[40px] left-[45px] transition-all duration-300 ${
            isHovering ? "rotate-[20deg] scale-150" : "rotate-[30deg] scale-125"
          }`}
        />
        <StarIcon
          className={`text-brandPrimary absolute top-[40px] right-[45px] transition-all duration-300 ${
            isHovering
              ? "rotate-[-20deg] scale-150"
              : "rotate-[-30deg] scale-125"
          }`}
        />
        <StarIcon
          className={`text-secondary absolute bottom-[40px] left-[55px] transition-all duration-300 ${
            isHovering
              ? "rotate-[-20deg] scale-100"
              : "rotate-[-30deg] scale-95"
          }`}
        />
        <StarIcon
          className={`text-secondary absolute bottom-[40px] right-[55px] transition-all duration-300 ${
            isHovering ? "rotate-[20deg] scale-100" : "rotate-[30deg] scale-95"
          }`}
        />
        <div className="mt-2 relative block h-[200px] w-[204px] mx-auto mb-[-50px]">
          <EnvelopeTop className="absolute bottom-0" />
          <EnvelopePaper
            className={`absolute bottom-0 left-4 transition-all duration-300 ${
              isHovering ? "bottom-2" : "bottom-0"
            }`}
          />
          <EnvelopeBottom className="text-brandPrimary absolute bottom-0" />
        </div>
      </div>
      <h2 className="text-primary text-xl font-bold mt-4">
        Get proposal updates in your inbox!
      </h2>
      <p className="text-secondary mt-2 font-normal">
        Receive email notifications when proposals go live, and when the voting
        window is ending soon.
      </p>
      <div className="flex flex-col items-center gap-1 mt-4">
        <Button variant="outline" className="w-full">
          Maybe later
        </Button>
        <Button
          className="w-full"
          onMouseOver={() => {
            setIsHovering(true);
          }}
          onMouseLeave={() => {
            setIsHovering(false);
          }}
        >
          Notify me
        </Button>
      </div>
    </div>
  );
};

export default SubscribeDialog;
