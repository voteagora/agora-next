"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DraftProposalForm from "../components/DraftProposalForm";
import DeleteDraftButton from "../components/DeleteDraftButton";
import ReactMarkdown from "react-markdown";
import { DraftProposal as DraftProposalType } from "@/app/proposals/draft/types";
import { useSIWE } from "connectkit";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useDraftStage } from "./hooks/useDraftStage";
import { DraftPageHeader } from "./components/DraftPageHeader";
import { SiweAccessCard } from "./components/SiweAccessCard";
import Loading from "./loading";

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
  const completedSignRef = useRef<boolean>(false);
  const pollIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasDraftRef = useRef<boolean>(false);

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
    if (!address) {
      try {
        localStorage.removeItem("agora-siwe-jwt");
        localStorage.removeItem("agora-siwe-stage");
      } catch {}
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
    }
  }, [address]);

  const {
    data,
    isLoading,
    refetch,
    error: queryError,
  } = useQuery({
    queryKey: ["draft", idParam, stageIndex],
    queryFn: async (): Promise<DraftResponse> => {
      const sessionRaw = localStorage.getItem("agora-siwe-jwt");
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
      setLoading(false);
    }
  }, [data, isLoading, queryError]);

  const { signIn } = useSIWE();
  useEffect(() => {
    if (!isSigning) return;
    const id = setInterval(() => {
      try {
        const stage = localStorage.getItem("agora-siwe-stage");
        if (completedSignRef.current) return;
        if (stage === "awaiting_response") {
          setSignLabel("Awaiting Confirmation");
        } else if (stage === "signed") {
          completedSignRef.current = true;
          setSignLabel("Signed");
        } else if (stage === "error") {
          setSignLabel("Cancelled");
        }
      } catch {}
    }, 200);
    pollIdRef.current = id;
    return () => clearInterval(id);
  }, [isSigning]);

  const handleSiwe = useCallback(async () => {
    try {
      if (isSigning) return;
      setIsSigning(true);
      setPostSignGrace(true);
      setError(null);
      completedSignRef.current = false;
      try {
        localStorage.removeItem("agora-siwe-stage");
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
        localStorage.setItem("agora-siwe-stage", "error");
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

  const loadedAfterJwtRef = useRef<boolean>(false);
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const stage = localStorage.getItem("agora-siwe-stage");
        const sessionRaw = localStorage.getItem("agora-siwe-jwt");
        const hasJwt = Boolean(sessionRaw);
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
              localStorage.removeItem("agora-siwe-stage");
            } catch {}
            if (pollIdRef.current) {
              clearInterval(pollIdRef.current);
              pollIdRef.current = null;
            }
            return;
          }
          completedSignRef.current = true;
          setSignLabel("Signed");
          if (!loadedAfterJwtRef.current) {
            loadedAfterJwtRef.current = true;
            await refetch();
          }
          setTimeout(() => {
            setSignLabel(null);
            setIsSigning(false);
            setPostSignGrace(false);
            if (pollIdRef.current) {
              clearInterval(pollIdRef.current);
              pollIdRef.current = null;
            }
          }, 600);
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
              localStorage.removeItem("agora-siwe-stage");
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
    }, 200);
    return () => clearInterval(id);
  }, [isSigning, refetch]);

  if (!hasDraftRef.current && !draft && !error) {
    if (loading) return <Loading />;
    return (
      <div className="max-w-screen-xl mx-auto mt-10">
        <SiweAccessCard
          error={null}
          isSigning={isSigning}
          signLabel={signLabel}
          onConnectClick={() => {}}
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
        <SiweAccessCard
          error={isSigning ? null : error}
          isSigning={isSigning}
          signLabel={signLabel}
          onConnectClick={() => {}}
          onSignClick={handleSiwe}
          isSwitching={isSwitching}
          hasAddress={Boolean(address)}
        />
      </div>
    );
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
            draftIdForBack={(draft as any).uuid || String(draft.id)}
          />
          <div className="flex items-center justify-end mt-4">
            <DeleteDraftButton proposalId={draft.id} />
          </div>
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
