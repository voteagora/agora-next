"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import DraftProposalForm from "../components/DraftProposalForm";
import DeleteDraftButton from "../components/DeleteDraftButton";
import ReactMarkdown from "react-markdown";
import {
  DraftProposal as DraftProposalType,
  PLMConfig,
} from "@/app/proposals/draft/types";
import { useSIWE } from "connectkit";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useDraftStage } from "./hooks/useDraftStage";
import { DraftPageHeader } from "./components/DraftPageHeader";
import { SiweAccessCard } from "./components/SiweAccessCard";
import {
  LOCAL_STORAGE_SIWE_JWT_KEY,
  LOCAL_STORAGE_SIWE_STAGE_KEY,
} from "@/lib/constants";
import ForbiddenAccessCard from "./components/ForbiddenAccessCard";
import Loading from "./loading";
import Tenant from "@/lib/tenant/tenant";
import ShareDraftLink from "./components/ShareDraftLink";

type DraftResponse = DraftProposalType;

export default function DraftProposalPageClient({
  idParam,
  searchParams,
  proposalTypes,
}: {
  idParam: string;
  searchParams?: { [key: string]: string | string[] | undefined };
  proposalTypes: any[];
}) {
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signLabel, setSignLabel] = useState<string | null>(null);
  const [postSignGrace, setPostSignGrace] = useState<boolean>(false);
  const [advancing, setAdvancing] = useState<boolean>(false);
  const completedSignRef = useRef<boolean>(false);
  const pollIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasDraftRef = useRef<boolean>(false);
  const wasConnectedRef = useRef<boolean>(false);

  const urlSearchParams = useSearchParams();
  const shareParam = urlSearchParams?.get("share");
  const { ui } = Tenant.current();
  const plmConfig = ui.toggle("proposal-lifecycle")?.config as PLMConfig;
  const isShareMode = Boolean(plmConfig?.allowDraftSharing && shareParam);

  const {
    stageIndex,
    stageObject,
    stageMetadata,
    DRAFT_STAGES_FOR_TENANT,
    config,
    targetChainId,
  } = useDraftStage(searchParams);
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

  useEffect(() => {
    // Do not clear SIWE session on disconnect/refresh; only reset local UI state
    if (!address) {
      setDraft(null);
      hasDraftRef.current = false;
      setIsSigning(false);
      setSignLabel(null);
      setPostSignGrace(false);
      setError(null);
      if (pollIdRef.current) {
        clearInterval(pollIdRef.current);
        pollIdRef.current = null;
      }
      wasConnectedRef.current = false;
      return;
    }
    // Connected
    wasConnectedRef.current = true;
  }, [address]);

  const {
    data,
    isLoading,
    refetch,
    error: queryError,
  } = useQuery({
    queryKey: ["draft", idParam, stageIndex, shareParam],
    queryFn: async (): Promise<DraftResponse> => {
      const currentShareParam = new URLSearchParams(window.location.search).get(
        "share"
      );
      const shouldUseShareMode =
        plmConfig?.allowDraftSharing && currentShareParam;

      if (shouldUseShareMode) {
        const res = await fetch(
          `/api/v1/drafts/${idParam}?share=${currentShareParam}`
        );
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("Invalid share link");
          }
          throw new Error(`${res.status} ${res.statusText}`);
        }
        return res.json();
      }

      const sessionRaw = localStorage.getItem(LOCAL_STORAGE_SIWE_JWT_KEY);
      if (!sessionRaw) {
        throw new Error("Not authenticated (missing SIWE session)");
      }
      const token = JSON.parse(sessionRaw)?.access_token as string | undefined;
      if (!token) {
        throw new Error("Not authenticated (invalid session)");
      }
      const res = await fetch(`/api/v1/drafts/${idParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          // Soft-expiration handling: trigger SIWE CTA without clearing session
          throw new Error("Not authenticated");
        }
        if (res.status === 403) {
          throw new Error("Forbidden, you are not the owner of this draft");
        }
        throw new Error(`${res.status} ${res.statusText}`);
      }
      return res.json();
    },
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    staleTime: 0,
  });

  useEffect(() => {
    if (data) {
      setDraft(data);
      setError(null);
      setLoading(false);
      hasDraftRef.current = true;
    } else if (isLoading) {
      if (!hasDraftRef.current) setLoading(true);
    } else if (queryError) {
      setError((queryError as Error).message);
      // Avoid sticky signing UI on auth errors and clear transient stage
      setIsSigning(false);
      setSignLabel(null);
      try {
        const msg = String((queryError as Error).message || "").toLowerCase();
        if (msg.includes("forbidden") || msg.includes("not authenticated")) {
          localStorage.removeItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
        }
      } catch {}
      setLoading(false);
    }
  }, [data, isLoading, queryError]);

  const { signIn } = useSIWE();

  // On mount: if user refreshed/closed while awaiting signature and no JWT exists, reset UI state
  useEffect(() => {
    try {
      const stage = localStorage.getItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
      const hasJwt = Boolean(localStorage.getItem(LOCAL_STORAGE_SIWE_JWT_KEY));
      if (stage === "awaiting_response" && !hasJwt) {
        localStorage.removeItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
        setIsSigning(false);
        setSignLabel(null);
        setPostSignGrace(false);
        completedSignRef.current = false;
      }
    } catch {}
  }, []);
  // consolidated into main polling effect

  const handleSiwe = useCallback(async () => {
    try {
      if (isSigning) return;
      setIsSigning(true);
      setPostSignGrace(true);
      setError(null);
      completedSignRef.current = false;
      try {
        localStorage.removeItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
      } catch {}
      if (!address) {
        setError("Please connect your wallet before signing");
        return;
      }
      if (currentChainId !== targetChainId && switchChainAsync) {
        try {
          await switchChainAsync({ chainId: targetChainId });
        } catch (e) {
          setError("Failed to switch network for this tenant");
          return;
        }
      }
      setSignLabel("Awaiting Confirmation");
      await signIn();
    } catch {
      setSignLabel("Cancelled");
      setError("Signature cancelled by user");
      try {
        localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
      } catch {}
      setIsSigning(false);
      setPostSignGrace(false);
      completedSignRef.current = false;
      if (pollIdRef.current) {
        clearInterval(pollIdRef.current);
        pollIdRef.current = null;
      }
    } finally {
    }
  }, [
    isSigning,
    address,
    currentChainId,
    targetChainId,
    switchChainAsync,
    signIn,
  ]);

  const onDeleteSuccess = useCallback(() => {
    window.location.href = "/";
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const stage = localStorage.getItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
        const sessionRaw = localStorage.getItem(LOCAL_STORAGE_SIWE_JWT_KEY);
        const hasJwt = Boolean(sessionRaw);
        const isForbidden = (error || "").toLowerCase().includes("forbidden");
        const shouldAdvance = hasJwt && !draft && !isForbidden;
        if (hasJwt && stage !== "awaiting_response") {
          if (isSigning) setIsSigning(false);
          if (signLabel) setSignLabel(null);
        }
        if (isForbidden) {
          // Stop signing UI and clear stage to avoid flicker when access is forbidden
          setIsSigning(false);
          setSignLabel(null);
          try {
            localStorage.removeItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
          } catch {}
        }
        if (stage === "awaiting_response") {
          if (!isSigning) setIsSigning(true);
          if (!completedSignRef.current) setSignLabel("Awaiting Confirmation");
        } else if (stage === "signed") {
          if (!hasJwt) {
            setSignLabel(null);
            setIsSigning(false);
            setPostSignGrace(false);
            completedSignRef.current = false;
            try {
              localStorage.removeItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
            } catch {}
            if (pollIdRef.current) {
              clearInterval(pollIdRef.current);
              pollIdRef.current = null;
            }
            return;
          }
          if (shouldAdvance) {
            completedSignRef.current = true;
            setSignLabel("Signed");
            setAdvancing(true);
            setError(null);
            await refetch();
            setSignLabel(null);
            setIsSigning(false);
            setPostSignGrace(false);
            setAdvancing(false);
            try {
              localStorage.removeItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
            } catch {}
            if (pollIdRef.current) {
              clearInterval(pollIdRef.current);
              pollIdRef.current = null;
            }
          }
        } else if (shouldAdvance) {
          try {
            localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "signed");
          } catch {}
          completedSignRef.current = true;
          setSignLabel("Signed");
          setAdvancing(true);
          setError(null);
          await refetch();
          setSignLabel(null);
          setIsSigning(false);
          setPostSignGrace(false);
          setAdvancing(false);
          try {
            localStorage.removeItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
          } catch {}
          if (pollIdRef.current) {
            clearInterval(pollIdRef.current);
            pollIdRef.current = null;
          }
        } else if (stage === "error") {
          setIsSigning(false);
          setSignLabel("Cancelled");
          setError("Signature cancelled by user");
          setTimeout(() => {
            setSignLabel(null);
            setPostSignGrace(false);
            completedSignRef.current = false;
            if (pollIdRef.current) {
              clearInterval(pollIdRef.current);
              pollIdRef.current = null;
            }
            try {
              localStorage.removeItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
            } catch {}
          }, 600);
        } else {
          if (!hasJwt) {
            setSignLabel(null);
            setIsSigning(false);
            setPostSignGrace(false);
            completedSignRef.current = false;
          }
        }
      } catch {}
    }, 250);
    pollIdRef.current = id;
    return () => clearInterval(id);
  }, [isSigning, signLabel, draft, error, refetch]);

  if (advancing) {
    return <Loading />;
  }

  if (isShareMode) {
    if (isLoading) return <Loading />;
    if (error) {
      return (
        <div className="max-w-screen-xl mx-auto mt-10">
          <ForbiddenAccessCard message={error} />
        </div>
      );
    }
  } else {
    if (!hasDraftRef.current && !draft && !error) {
      if (isLoading) return <Loading />;
      return (
        <div className="max-w-screen-xl mx-auto mt-10">
          <SiweAccessCard
            error={null}
            isSigning={isSigning}
            signLabel={signLabel}
            onSignClick={handleSiwe}
            isSwitching={isSwitching}
            hasAddress={Boolean(address)}
          />
        </div>
      );
    }

    if (error || ((isSigning || postSignGrace) && !draft)) {
      return (
        <div className="max-w-screen-xl mx-auto mt-10">
          {error && error.toLowerCase().includes("forbidden") ? (
            <ForbiddenAccessCard message={error} />
          ) : (
            <SiweAccessCard
              error={isSigning ? null : error}
              isSigning={isSigning}
              signLabel={signLabel}
              onSignClick={handleSiwe}
              isSwitching={isSwitching}
              hasAddress={Boolean(address)}
            />
          )}
        </div>
      );
    }
  }

  if (!draft && !isSigning && !postSignGrace && !error && hasDraftRef.current) {
    return <div className="text-secondary">Draft not found.</div>;
  }

  return (
    <main className="max-w-screen-xl mx-auto mt-10">
      {draft && (
        <>
          <DraftPageHeader
            stageIndex={stageIndex}
            stageTitle={stageMetadata?.title}
            totalStages={DRAFT_STAGES_FOR_TENANT.length}
            draftIdForBack={(draft as any).uuid}
          />
          {!isShareMode && (
            <div className="flex items-center justify-end gap-4 mt-4">
              {plmConfig?.allowDraftSharing && (
                <ShareDraftLink
                  draftUuid={(draft as any).uuid}
                  authorAddress={draft.author_address}
                />
              )}
              <DeleteDraftButton
                proposalId={draft.id}
                onDeleteSuccess={onDeleteSuccess}
              />
            </div>
          )}
          {isShareMode && (
            <div className="mt-4 p-3 bg-wash border border-line rounded-lg text-secondary text-sm">
              You are viewing a shared draft proposal (read-only).
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-y-0 gap-x-0 sm:gap-x-6 mt-6">
            <section className="col-span-1 sm:col-span-2 order-last sm:order-first">
              <DraftProposalForm
                proposalTypes={proposalTypes}
                stage={stageObject.stage}
                draftProposal={draft}
              />
            </section>
            <section className="col-span-1">
              <div className="bg-wash border border-line rounded-2xl p-4">
                <div className="mt-2">
                  <ReactMarkdown className="prose-h2:text-lg prose-h2:font-bold prose-h2:text-primary prose-p:text-secondary prose-p:mt-2 prose-li:list-inside prose-li:list-decimal prose-li:my-2 prose-a:text-primary prose-a:underline prose-li:text-secondary">
                    {config?.copy?.helperText}
                  </ReactMarkdown>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
