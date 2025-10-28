"use client";

import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import DelegateStatement from "./DelegateStatement";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { useDelegateStatementStore } from "@/stores/delegateStatement";
import { useEffect, useRef } from "react";

interface Props {
  delegate: Delegate;
}

export default function DelegateStatementContainer({ delegate }: Props) {
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();
  const showSuccessMessage = useDelegateStatementStore(
    (state) => state.showSaveSuccess
  );
  const setSaveSuccess = useDelegateStatementStore(
    (state) => state.setSaveSuccess
  );

  const delegateStatement = (
    delegate?.statement?.payload as { delegateStatement: string }
  )?.delegateStatement;

  const successBannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showSuccessMessage) return;
    const banner = successBannerRef.current;
    if (!banner) return;
    const isMobileViewport =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(max-width: 768px)").matches;
    if (!isMobileViewport) return;

    const bannerTop = banner.getBoundingClientRect().top + window.scrollY;
    const offset = 80;
    window.scrollTo({
      top: Math.max(0, bannerTop - offset),
      behavior: "smooth",
    });
  }, [showSuccessMessage]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      setSaveSuccess(false);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [setSaveSuccess]);

  return (
    <>
      {showSuccessMessage && (
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4"
          role="alert"
          ref={successBannerRef}
        >
          <p className="font-bold">Statement Saved</p>
          <p>Nice! Thank you for telling the community what you believe in.</p>
        </div>
      )}
      {!delegateStatement && (
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-primary">
            Delegate Statement
          </h2>
          <p className="break-words p-8 text-center text-secondary align-middle bg-neutral rounded-xl shadow-newDefault border border-line">
            No delegate statement for {delegate.address}
          </p>
          {isConnected && address === delegate.address && (
            <p className="my-3">
              <a
                rel="noopener"
                target="_blank"
                className="underline"
                href="/delegates/create"
              >
                Create your delegate statement
              </a>
            </p>
          )}
        </div>
      )}

      {delegateStatement && <DelegateStatement statement={delegateStatement} />}
    </>
  );
}
