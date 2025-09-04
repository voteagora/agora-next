"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GET_DRAFT_STAGES, getStageMetadata } from "../utils/stages";
import DraftProposalForm from "../components/DraftProposalForm";
import DeleteDraftButton from "../components/DeleteDraftButton";
import BackButton from "../components/BackButton";
import ReactMarkdown from "react-markdown";
import Tenant from "@/lib/tenant/tenant";
import { PLMConfig } from "@/app/proposals/draft/types";
import { useSIWE } from "connectkit";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

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

  const loadDraft = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const sessionRaw = localStorage.getItem("agora-siwe-jwt");
      if (!sessionRaw) {
        setError("Not authenticated (missing SIWE session)");
        setLoading(false);
        return;
      }
      const token = JSON.parse(sessionRaw)?.access_token as string | undefined;
      if (!token) {
        setError("Not authenticated (invalid session)");
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/v1/drafts/${idParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError(`${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setDraft(data);
      setError(null);
      setLoading(false);
    } catch (e: any) {
      setError(e.message || "Failed to load draft");
      setLoading(false);
    }
  }, [idParam]);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const { signIn } = useSIWE();
  const handleSiwe = useCallback(async () => {
    try {
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
      await signIn();
      await loadDraft();
    } catch {
      // ignore
    }
  }, [
    address,
    currentChainId,
    targetChainId,
    switchChainAsync,
    signIn,
    loadDraft,
  ]);

  if (loading) {
    return <div className="text-secondary">Loading…</div>;
  }

  if (error) {
    const needsSiwe = error.toLowerCase().includes("not authenticated");
    return (
      <div className="text-secondary">
        {error}
        {needsSiwe && (
          <div className="mt-4">
            <button
              onClick={handleSiwe}
              disabled={!address || isSwitching}
              className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
            >
              Sign in with Ethereum
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!draft) {
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
