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
    delegateToProxyData: `0x${string}` | undefined;
    subdelegateData: `0x${string}` | undefined;
  };
}) {
  const { ui } = Tenant.current();
  const faqLink = ui.link("advanced-delegation-faq");
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

      <h1 className="mt-4 mb-2 text-2xl font-extrabold text-primary">
        You&apos;ve delegated your votes!
      </h1>
      <p className="text-secondary">
        Your delegation has been submitted successfully and now being indexed...
        (this can take up to 2 minutes). Actual amount of tokens delegated can
        be slightly different due to{" "}
        <a
          className="underline"
          href={faqLink?.url}
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
        hash1={data.delegateToProxyData}
        hash2={data.subdelegateData}
      />
    </div>
  );
}
