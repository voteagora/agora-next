"use client";

import { useState } from "react";
import StarIcon from "./DialogImage/Star";
import EnvelopeBottom from "./DialogImage/EnvelopeBottom";
import EnvelopeTop from "./DialogImage/EnvelopeTop";
import EnvelopePaper from "./DialogImage/EnvelopePaper";
import { Button } from "../ui/button";
import { updateNotificationPreferencesForAddress } from "@/app/delegates/actions";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";

const HeroImage = ({ isHovering }: { isHovering: boolean }) => {
  return (
    <div className="flex items-center gap-2 bg-tertiary/5 rounded-lg relative overflow-y-hidden">
      <div className="absolute w-full h-full bg-[url('/images/grid.svg')]"></div>
      <StarIcon
        className={`text-brandPrimary absolute top-[40px] left-[45px] transition-all duration-500 ${
          isHovering ? "rotate-[20deg] scale-150" : "rotate-[30deg] scale-125"
        }`}
      />
      <StarIcon
        className={`text-brandPrimary absolute top-[40px] right-[45px] transition-all duration-500 ${
          isHovering ? "rotate-[-20deg] scale-150" : "rotate-[-30deg] scale-125"
        }`}
      />
      <StarIcon
        className={`text-secondary absolute bottom-[40px] left-[55px] transition-all duration-500 ${
          isHovering ? "rotate-[-20deg] scale-100" : "rotate-[-30deg] scale-95"
        }`}
      />
      <StarIcon
        className={`text-secondary absolute bottom-[40px] right-[55px] transition-all duration-500 ${
          isHovering ? "rotate-[20deg] scale-100" : "rotate-[30deg] scale-95"
        }`}
      />
      <div className="mt-2 relative block h-[200px] w-[204px] mx-auto mb-[-50px]">
        <EnvelopeTop className="absolute bottom-0" />
        <EnvelopePaper
          className={`absolute bottom-0 left-4 transition-all ${
            isHovering ? "bottom-[-8px] duration-500" : "bottom-2 duration-300"
          }`}
        />
        <EnvelopeBottom className="text-brandPrimary absolute bottom-0" />
      </div>
    </div>
  );
};

const SubscribeDialog = ({ closeDialog }: { closeDialog: () => void }) => {
  const { address } = useAccount();
  const [isHovering, setIsHovering] = useState(false);

  if (!address) return null;

  return (
    <div>
      <HeroImage isHovering={isHovering} />
      <h2 className="text-primary text-xl font-bold mt-4">
        Get proposal updates in your inbox!
      </h2>
      <p className="text-secondary mt-2 font-normal">
        Receive email notifications when proposals go live, and when the voting
        window is ending soon.
      </p>
      <div className="flex flex-col items-center gap-1 mt-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            // TODO: we don't want to wipe out any existing preferences
            // setting both to false might not be the best solution?
            // If this dialog tightly couples both preferences, we might have to...
            await updateNotificationPreferencesForAddress(address, {
              wants_proposal_created_email: false,
              wants_proposal_ending_soon_email: false,
            });
            closeDialog();
          }}
        >
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
          onClick={async () => {
            await updateNotificationPreferencesForAddress(address, {
              wants_proposal_created_email: true,
              wants_proposal_ending_soon_email: true,
            });
            closeDialog();
            toast.success("Preferences saved.");
          }}
        >
          Notify me
        </Button>
      </div>
    </div>
  );
};

export default SubscribeDialog;
