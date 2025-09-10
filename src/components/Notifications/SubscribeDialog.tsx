"use client";

import { updateNotificationPreferencesForAddress } from "@/app/delegates/actions";
import { useDelegate } from "@/hooks/useDelegate";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import EnvelopeBottom from "./DialogImage/EnvelopeBottom";
import EnvelopePaper from "./DialogImage/EnvelopePaper";
import EnvelopeTop from "./DialogImage/EnvelopeTop";
import StarIcon from "./DialogImage/Star";
import Link from "next/link";

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

const SubscribeDialog = ({
  closeDialog,
  type,
}: {
  closeDialog: () => void;
  type: "root" | "vote";
}) => {
  const { address } = useAccount();
  const [isHovering, setIsHovering] = useState(false);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const { data: delegate, refetch } = useDelegate({ address: address });
  const existingEmail = null;
  const hasEmail = false;

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
      {!hasEmail && (
        <div className="flex flex-col gap-1 w-full mt-4">
          <label className="text-xs font-semibold secondary">
            Email address
          </label>
          <input
            type="text"
            className="border bg-wash border-line placeholder:text-tertiary text-primary p-2 rounded-lg w-full"
            value={email}
            placeholder="your@email.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}
      <div className="flex flex-col items-center gap-1 mt-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            localStorage.setItem(
              `agora-email-subscriptions--${type}`,
              "prompted"
            );
            try {
              closeDialog();
              toast.success(
                <span>
                  No problem! We won&apos;t bug you again. You can change your
                  preferences in{" "}
                  <Link className="underline" href={`/delegates/${address}`}>
                    your profile
                  </Link>
                </span>
              );
              await updateNotificationPreferencesForAddress(
                address,
                existingEmail || email || "",
                {
                  wants_proposal_created_email: "prompted",
                  wants_proposal_ending_soon_email: "prompted",
                }
              );
              // refresh delegate data
              await refetch();
            } catch (error) {
              console.error(error);
            }
          }}
        >
          No thanks
        </Button>
        <Button
          disabled={!(existingEmail || email)}
          className="w-full"
          onMouseOver={() => {
            setIsHovering(true);
          }}
          onMouseLeave={() => {
            setIsHovering(false);
          }}
          onClick={async () => {
            try {
              if (!existingEmail && !email) {
                toast.error("Please enter an email address.");
                return;
              }
              await updateNotificationPreferencesForAddress(
                address,
                (existingEmail || email) as string,
                {
                  wants_proposal_created_email: true,
                  wants_proposal_ending_soon_email: true,
                }
              );
              // refresh delegate data
              await refetch();
              closeDialog();
              toast.success("Preferences saved.");
            } catch (error) {
              toast.error("Error updating notification preferences.");
              console.error(error);
            }
          }}
        >
          Notify me
        </Button>
      </div>
    </div>
  );
};

export default SubscribeDialog;
