import React, { useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { Button } from "../../../components/ui/button";

const TermsStage = ({ onSuccess }: { onSuccess: () => void }) => {
  const { address } = useAccount();
  const { signMessage, status: signMessageStatus } = useSignMessage();

  useEffect(() => {
    if (signMessageStatus === "success") {
      onSuccess();
    }
  }, [signMessageStatus, onSuccess]);

  return (
    <main className="grid grid-cols-8 gap-10 mt-12">
      <section className="col-span-5">
        <div className="bg-white rounded-2xl border border-line p-6 shadow-newDefault">
          <h1 className="text-2xl font-black text-primary">
            Terms and Conditions
          </h1>
          <p className="text-secondary mt-4 font-medium">
            Last updated: October 9, 2023
          </p>
          {/* TODO (mg) update this copy with real terms from scroll */}
          <p className="text-secondary mt-10 font-medium">
            Scroll Foundation (“Scroll Foundation”, “we,” “us,” or “our”),
            currently provides a website-hosted user interface that can be
            accessed at https://scroll.io/bridge (the “Interface”) for
            accessing, and certain information about, Scroll network, a layer-2
            protocol that scales Ethereum (“Scroll”), as well as related content
            about Scroll and functionality through websites located at
            https://scroll.io, which includes https://scroll.io/bridge,
            https://scroll.io/portal (each, a “Site” and collectively, the
            “Sites”). We also currently provide access and information about
            Scroll through our related technologies, including all of our
            existing and any updated or new features, functionalities and
            technologies (the Interface and all such features, functionalities
            and technologies, collectively, the “Service”).
          </p>
          <p className="text-secondary mt-10 font-medium">
            Scroll Foundation (“Scroll Foundation”, “we,” “us,” or “our”),
            currently provides a website-hosted user interface that can be
            accessed at https://scroll.io/bridge (the “Interface”) for
            accessing, and certain information about, Scroll network, a layer-2
            protocol that scales Ethereum (“Scroll”), as well as related content
            about Scroll and functionality through websites located at
            https://scroll.io, which includes https://scroll.io/bridge,
            https://scroll.io/portal (each, a “Site” and collectively, the
            “Sites”). We also currently provide access and information about
            Scroll through our related technologies, including all of our
            existing and any updated or new features, functionalities and
            technologies (the Interface and all such features, functionalities
            and technologies, collectively, the “Service”).
          </p>
          <p className="text-secondary mt-10 font-medium">
            Scroll Foundation (“Scroll Foundation”, “we,” “us,” or “our”),
            currently provides a website-hosted user interface that can be
            accessed at https://scroll.io/bridge (the “Interface”) for
            accessing, and certain information about, Scroll network, a layer-2
            protocol that scales Ethereum (“Scroll”), as well as related content
            about Scroll and functionality through websites located at
            https://scroll.io, which includes https://scroll.io/bridge,
            https://scroll.io/portal (each, a “Site” and collectively, the
            “Sites”). We also currently provide access and information about
            Scroll through our related technologies, including all of our
            existing and any updated or new features, functionalities and
            technologies (the Interface and all such features, functionalities
            and technologies, collectively, the “Service”).
          </p>
          <p className="text-secondary mt-10 font-medium">
            Scroll Foundation (“Scroll Foundation”, “we,” “us,” or “our”),
            currently provides a website-hosted user interface that can be
            accessed at https://scroll.io/bridge (the “Interface”) for
            accessing, and certain information about, Scroll network, a layer-2
            protocol that scales Ethereum (“Scroll”), as well as related content
            about Scroll and functionality through websites located at
            https://scroll.io, which includes https://scroll.io/bridge,
            https://scroll.io/portal (each, a “Site” and collectively, the
            “Sites”). We also currently provide access and information about
            Scroll through our related technologies, including all of our
            existing and any updated or new features, functionalities and
            technologies (the Interface and all such features, functionalities
            and technologies, collectively, the “Service”).
          </p>
          <p className="text-secondary mt-10 font-medium">
            Scroll Foundation (“Scroll Foundation”, “we,” “us,” or “our”),
            currently provides a website-hosted user interface that can be
            accessed at https://scroll.io/bridge (the “Interface”) for
            accessing, and certain information about, Scroll network, a layer-2
            protocol that scales Ethereum (“Scroll”), as well as related content
            about Scroll and functionality through websites located at
            https://scroll.io, which includes https://scroll.io/bridge,
            https://scroll.io/portal (each, a “Site” and collectively, the
            “Sites”). We also currently provide access and information about
            Scroll through our related technologies, including all of our
            existing and any updated or new features, functionalities and
            technologies (the Interface and all such features, functionalities
            and technologies, collectively, the “Service”).
          </p>
        </div>
      </section>
      <section className="col-span-3">
        <div className="bg-white rounded-2xl border border-line p-6 shadow-newDefault sticky top-4 shadow-newDefault">
          <h1 className="text-2xl font-black text-primary">
            Agree to Terms and Conditions
          </h1>
          <p className="text-secondary mt-2 font-medium">
            Please sign to continue
          </p>
          <div className="mt-10">
            <Button
              variant="brandPrimary"
              className="w-full"
              onClick={() => {
                // TODO (mg) update this message with real terms from scroll
                signMessage({ message: "I agree to the terms and conditions" });
              }}
            >
              Agree
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TermsStage;
