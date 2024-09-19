import Image from "next/image";
import { Button } from "@/components/ui/button";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  closeDialog: () => void;
  hash: `0x${string}`;
}

export const PartialDelegationSuccess = ({ hash, closeDialog }: Props) => {
  const { ui } = Tenant.current();
  return (
    <div>
      <div className="w-full">
        <Image
          className="w-full"
          src={ui.assets.success}
          alt="Delegation successful image"
        />
      </div>

      <h1 className="mt-4 mb-2 text-2xl font-extrabold text-primary">
        You&apos;ve delegated your votes!
      </h1>
      <p className="text-secondary">
        Your delegation has been submitted successfully and now being indexed...
        (this can take up to 2 minutes). Actual amount of tokens delegated can
        be slightly different due to{" "}
        <a
          className="underline"
          href="https://argoagora.notion.site/Optimism-Agora-FAQ-3922ac9c66e54a21b5de16be9e0cf79c?pvs=4"
          target="_blank"
          rel="noopener noreferrer"
        >
          rounding
        </a>{" "}
        in calculation.
      </p>
      <Button className="w-full mt-6" onClick={() => closeDialog()}>
        Got it
      </Button>
      <BlockScanUrls hash1={hash} />
    </div>
  );
};
