import { Button } from "@/components/ui/button";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import Image from "next/image";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { useEffect } from "react";
import Tenant from "@/lib/tenant/tenant";

// TODO: Add notion link in "Learn more"
export function SuccessView({
  closeDialog,
  data,
}: {
  closeDialog: () => void;
  data: {
    delegateToProxyData: { hash: string } | undefined;
    subdelegateData: { hash: string } | undefined;
  };
}) {
  const { ui } = Tenant.current();
  const { refetchDelegate } = useConnectButtonContext();

  useEffect(() => {
    if (!refetchDelegate) {
      closeDialog();
    }
  }, [refetchDelegate, closeDialog]);

  return (
    <div>
      <div className="w-full">
        <Image
          className="w-full"
          src={ui.assets.success}
          alt="Delegation successful image"
        />
      </div>

      <h1 className="mt-4 mb-2 text-2xl font-extrabold">
        You&apos;ve delegated your votes!
      </h1>
      <p className="text-gray-700">
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
      <BlockScanUrls
        hash1={data.delegateToProxyData?.hash}
        hash2={data.subdelegateData?.hash}
      />
    </div>
  );
}
