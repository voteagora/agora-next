import { Button } from "@/components/Button";
import Image from "next/image";
import successfulDelegation from "public/images/successfulDelegation.svg";

// TODO: Add notion link in "Learn more"

export function SuccessView({ closeDialog }: { closeDialog: () => void }) {
  return (
    <div>
      <div className="w-full">
        <Image
          className="w-full"
          src={successfulDelegation}
          alt="Delegation successful image"
        />
      </div>

      <h1 className="font-extrabold text-2xl mt-4 mb-2">
        Your delegation has been submitted!
      </h1>
      <p className="text-gray-700">
        It might take up to a minute for the changes to be reflected. Actual
        amount of tokens delegated can sometimes be slightly different due to
        rounding in calculation.{" "}
        <a
          className="underline"
          href=""
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </a>
      </p>
      <Button className="w-full mt-6" onClick={() => closeDialog()}>
        Got it
      </Button>
    </div>
  );
}
