"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GET_DRAFT_STAGES, getStageMetadata } from "../utils/stages";
import DraftProposalForm from "../components/DraftProposalForm";
import DeleteDraftButton from "../components/DeleteDraftButton";
import BackButton from "../components/BackButton";
import ReactMarkdown from "react-markdown";
import Tenant from "@/lib/tenant/tenant";
import { PLMConfig } from "@/app/proposals/draft/types";
import { useSIWE } from "connectkit";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { UpdatedButton } from "@/components/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

type DraftResponse = any;

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
  const hasDraftRef = useRef<boolean>(false);

  const stageParam = (searchParams?.stage || "0") as string;
  const stageIndex = useMemo(() => parseInt(stageParam, 10), [stageParam]);
  const DRAFT_STAGES_FOR_TENANT = GET_DRAFT_STAGES()!;
  const stageObject = DRAFT_STAGES_FOR_TENANT[stageIndex];
  const stageMetadata = getStageMetadata(stageObject.stage);
  const { ui } = Tenant.current();
  const config = ui.toggle("proposal-lifecycle")?.config as PLMConfig;
  const targetChainId = Tenant.current().contracts.governor.chain.id;
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

  const loadDraft = useCallback(
    async (silent = false) => {
      try {
        setError(null);
        const manageLoading = !silent || !hasDraftRef.current;
        if (manageLoading) setLoading(true);
        const sessionRaw = localStorage.getItem("agora-siwe-jwt");
        if (!sessionRaw) {
          setError("Not authenticated (missing SIWE session)");
          if (manageLoading) setLoading(false);
          return;
        }
        const token = JSON.parse(sessionRaw)?.access_token as
          | string
          | undefined;
        if (!token) {
          setError("Not authenticated (invalid session)");
          if (manageLoading) setLoading(false);
          return;
        }
        const res = await fetch(`/api/v1/drafts/${idParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError(`${res.status} ${res.statusText}`);
          if (manageLoading) setLoading(false);
          return;
        }
        const data = await res.json();
        setDraft(data);
        hasDraftRef.current = true;
        setError(null);
        if (manageLoading) setLoading(false);
      } catch (e: any) {
        setError(e.message || "Failed to load draft");
        setLoading(false);
      }
    },
    [idParam]
  );

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const { signIn } = useSIWE();
  // Label watcher during signing (non-blocking)
  useEffect(() => {
    if (!isSigning) return;
    const id = setInterval(() => {
      try {
        const stage = localStorage.getItem("agora-siwe-stage");
        if (stage === "awaiting_response") setSignLabel("Awaiting response…");
        else if (stage === "signed") setSignLabel("Signed");
        else if (stage === "error") setSignLabel("Cancelled");
      } catch {}
    }, 200);
    return () => clearInterval(id);
  }, [isSigning]);
  const handleSiwe = useCallback(async () => {
    try {
      if (isSigning) return;
      setIsSigning(true);
      setPostSignGrace(true);
      try {
        localStorage.removeItem("agora-siwe-stage");
      } catch {}
      // Ensure connected account and correct network for this tenant
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
      // Trigger SIWE flow without blocking the UI; proceed when JWT appears
      // in localStorage (successful) or when timeout expires (failed)
      setSignLabel("Awaiting Confirmation");
      await signIn();
      setSignLabel("Signed");
      await loadDraft(true);
    } catch {
      setSignLabel("Cancelled");
      setError("Signature cancelled by user");
    } finally {
      setIsSigning(false);
      setTimeout(() => setSignLabel(null), 1200);
      setTimeout(() => setPostSignGrace(false), 600);
    }
  }, [
    isSigning,
    address,
    currentChainId,
    targetChainId,
    switchChainAsync,
    signIn,
    loadDraft,
  ]);

  const loadedAfterJwtRef = useRef<boolean>(false);
  // Poll localStorage to sync with SIWE modal (same-tab updates); advance automatically
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const stage = localStorage.getItem("agora-siwe-stage");
        const sessionRaw = localStorage.getItem("agora-siwe-jwt");
        const hasJwt = Boolean(sessionRaw);
        if (stage === "awaiting_response") {
          if (!isSigning) setIsSigning(true);
          setSignLabel("Awaiting Confirmation");
        } else if (stage === "signed") {
          setSignLabel("Signed");
          if (!loadedAfterJwtRef.current && hasJwt) {
            loadedAfterJwtRef.current = true;
            await loadDraft(true);
          }
          setTimeout(() => setSignLabel(null), 1200);
        } else if (stage === "error") {
          setIsSigning(false);
          setSignLabel("Cancelled");
          setError("Signature cancelled by user");
        }
      } catch {}
    }, 200);
    return () => clearInterval(id);
  }, [isSigning, loadDraft]);

  if (loading && !draft) {
    // Defer to the route segment's loading.tsx skeleton
    return null;
  }

  // Keep description text unchanged during signing; only buttons reflect state

  if (error) {
    const needsSiwe = error.toLowerCase().includes("not authenticated");
    return (
      <div className="max-w-screen-xl mx-auto mt-10">
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
            {!address ? (
              <div className="sm:w-auto">
                <ConnectKitButton.Custom>
                  {({ show }) => (
                    <UpdatedButton type="primary" onClick={show}>
                      Connect wallet
                    </UpdatedButton>
                  )}
                </ConnectKitButton.Custom>
              </div>
            ) : (
              <UpdatedButton
                type="primary"
                onClick={handleSiwe}
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
            {!needsSiwe && (
              <span className="text-tertiary text-xs">{error}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!draft && !isSigning && !postSignGrace) {
    return <div className="text-secondary">Draft not found.</div>;
  }

  return (
    <main className="max-w-screen-xl mx-auto mt-10">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-6">
          {stageIndex > 0 && (
            <BackButton
              draftProposalId={(draft as any).uuid || String(draft.id)}
              index={stageIndex}
            />
          )}
          <h1 className="font-black text-primary text-2xl m-0">
            {stageMetadata?.title}
          </h1>
          <span className="bg-tertiary/5 text-primary rounded-full px-2 py-1 text-sm">
            Step {stageObject.order + 1}/{DRAFT_STAGES_FOR_TENANT.length}
          </span>
        </div>
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
    </main>
  );
}
