"use client";

import { UpdatedButton } from "@/components/Button";
import { ConnectKitButton } from "connectkit";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export function SiweAccessCard({
  error,
  isSigning,
  signLabel,
  onConnectClick,
  onSignClick,
  isSwitching,
  hasAddress,
}: {
  error: string | null;
  isSigning: boolean;
  signLabel: string | null;
  onConnectClick: () => void;
  onSignClick: () => void;
  isSwitching: boolean;
  hasAddress: boolean;
}) {
  const needsSiwe = (error || "").toLowerCase().includes("not authenticated");
  return (
    <div className="bg-wash border border-line rounded-2xl shadow-newDefault p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-primary text-xl font-black">
            Authentication required
          </h2>
          <p className="text-secondary mt-2 max-w-prose">
            To access and edit this draft, please sign this access request.
            We’ll verify your ownership securely.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {!hasAddress ? (
          <div className="sm:w-auto">
            <ConnectKitButton.Custom>
              {({ show }) => (
                <UpdatedButton
                  type="primary"
                  onClick={() => {
                    onConnectClick();
                    if (typeof show === "function") show();
                  }}
                >
                  Connect wallet
                </UpdatedButton>
              )}
            </ConnectKitButton.Custom>
          </div>
        ) : (
          <UpdatedButton
            type="primary"
            onClick={onSignClick}
            isLoading={false}
            disabled={isSwitching || isSigning}
            className="sm:w-auto"
          >
            {isSigning ? (
              <span className="inline-flex items-center gap-2">
                {signLabel || "Awaiting Confirmation"}
                {(signLabel || "")
                  .toLowerCase()
                  .includes("awaiting confirmation") && (
                  <LoadingSpinner className="text-white h-4 w-4" />
                )}
              </span>
            ) : (
              "Sign access request"
            )}
          </UpdatedButton>
        )}
        {!needsSiwe && <span className="text-tertiary text-xs">{error}</span>}
      </div>
    </div>
  );
}
