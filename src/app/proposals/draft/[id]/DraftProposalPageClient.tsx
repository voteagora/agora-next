"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useSIWE } from "connectkit";
import { DraftProposal } from "../types";
import { SiweAccessCard } from "./components/SiweAccessCard";
import { ForbiddenAccessCard } from "./components/ForbiddenAccessCard";
import { DraftPageHeader } from "./components/DraftPageHeader";
import { useDraftStage } from "./hooks/useDraftStage";
import { isPostSubmission } from "../utils/stages";
import ArchivedDraftProposal from "../components/ArchivedDraftProposal";
import DeleteDraftButton from "../components/DeleteDraftButton";
import ReactMarkdown from "react-markdown";
import OnlyOwner from "./components/OwnerOnly";
import {
  LOCAL_STORAGE_SIWE_JWT_KEY,
  LOCAL_STORAGE_SIWE_STAGE_KEY,
} from "@/lib/constants";

type SearchParams =
  | { [key: string]: string | string[] | undefined }
  | undefined;

interface DraftProposalPageClientProps {
  draftProposal: DraftProposal;
  searchParams: SearchParams;
}

export default function DraftProposalPageClient({
  draftProposal: initialDraftProposal,
  searchParams,
}: DraftProposalPageClientProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { signIn, isSignedIn } = useSIWE();

  const {
    stageIndex,
    stageObject,
    stageMetadata,
    DRAFT_STAGES_FOR_TENANT,
    config,
    targetChainId,
  } = useDraftStage(searchParams);

  const [siweStage, setSiweStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signLabel, setSignLabel] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  // Query for fetching draft with JWT authentication
  const {
    data: draftProposal,
    isLoading: isDraftLoading,
    error: draftError,
    refetch: refetchDraft,
  } = useQuery({
    queryKey: ["draft", initialDraftProposal.uuid || initialDraftProposal.id, stageIndex],
    queryFn: async () => {
      const jwt = localStorage.getItem(LOCAL_STORAGE_SIWE_JWT_KEY);
      if (!jwt) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `/api/v1/drafts/${initialDraftProposal.uuid || initialDraftProposal.id}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Not authenticated");
      }
      if (response.status === 403) {
        throw new Error("Forbidden: you are not the owner of this draft");
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    },
    initialData: initialDraftProposal,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Monitor localStorage for SIWE stage changes
  useEffect(() => {
    const checkSiweStage = () => {
      const stage = localStorage.getItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
      setSiweStage(stage);
    };

    checkSiweStage();
    const interval = setInterval(checkSiweStage, 500);
    return () => clearInterval(interval);
  }, []);

  // Handle SIWE stage transitions
  useEffect(() => {
    const jwt = localStorage.getItem(LOCAL_STORAGE_SIWE_JWT_KEY);
    
    if (siweStage === "signed" && jwt) {
      // Clear the stage and refetch data
      localStorage.removeItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
      setError(null);
      refetchDraft();
    } else if (siweStage === "awaiting_response" && jwt) {
      // JWT received, advance to signed
      localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "signed");
    } else if (siweStage === "signed" && !jwt) {
      // Signed but no JWT, something went wrong
      localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
      setError("Authentication failed");
    } else if (siweStage === "error") {
      setError("Authentication failed");
      setIsSigning(false);
      setSignLabel(null);
    }
  }, [siweStage, refetchDraft]);

  // Handle sign-in process
  const handleSignIn = useCallback(async () => {
    if (!address) return;

    try {
      setIsSigning(true);
      setError(null);
      setSignLabel("Awaiting Confirmation");
      localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "awaiting_response");

      if (chainId !== targetChainId) {
        setIsSwitching(true);
        await switchChain({ chainId: targetChainId });
        setIsSwitching(false);
      }

      await signIn();
    } catch (e: any) {
      console.error("Sign-in error:", e);
      setError(e.message || "Sign-in failed");
      setIsSigning(false);
      setSignLabel(null);
      localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
    }
  }, [address, chainId, targetChainId, switchChain, signIn]);

  const handleConnectClick = useCallback(() => {
    setError(null);
  }, []);

  // Determine what to render based on authentication state
  const isAuthenticated = !!localStorage.getItem(LOCAL_STORAGE_SIWE_JWT_KEY);
  const needsAuth = draftError?.message?.includes("Not authenticated");
  const isForbidden = draftError?.message?.includes("Forbidden");

  if (needsAuth || (!isAuthenticated && !isDraftLoading)) {
    return (
      <main className="max-w-screen-xl mx-auto mt-10">
        <SiweAccessCard
          error={error}
          isSigning={isSigning}
          signLabel={signLabel}
          onConnectClick={handleConnectClick}
          onSignClick={handleSignIn}
          isSwitching={isSwitching}
          hasAddress={!!address}
        />
      </main>
    );
  }

  if (isForbidden) {
    return (
      <main className="max-w-screen-xl mx-auto mt-10">
        <ForbiddenAccessCard message="You are not the owner of this draft." />
      </main>
    );
  }

  if (isDraftLoading || !draftProposal) {
    return (
      <main className="max-w-screen-xl mx-auto mt-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </main>
    );
  }

  const isPostSubmissionStage = isPostSubmission(draftProposal.stage);
  const ownerAddresses = draftProposal.author_address
    ? [draftProposal.author_address]
    : [];

  if (isPostSubmissionStage) {
    return <ArchivedDraftProposal draftProposal={draftProposal} />;
  }

  const StageComponent = stageObject.component;

  return (
    <OnlyOwner ownerAddresses={ownerAddresses}>
      <main className="max-w-screen-xl mx-auto mt-10">
        <div className="flex flex-row items-center justify-between">
          <DraftPageHeader
            stageIndex={stageIndex}
            stageTitle={stageMetadata.title}
            totalStages={DRAFT_STAGES_FOR_TENANT.length}
            draftIdForBack={draftProposal.uuid ?? draftProposal.id.toString()}
          />
          <DeleteDraftButton
            draftProposal={draftProposal}
            message=""
            signature=""
          />
        </div>

        <div className="mt-6">
          <StageComponent
            draftProposal={draftProposal}
            config={config}
            searchParams={searchParams}
          />
        </div>

        {draftProposal.description && (
          <div className="mt-8 p-6 bg-wash border border-line rounded-2xl">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Description
            </h3>
            <ReactMarkdown className="prose prose-sm max-w-none text-secondary">
              {draftProposal.description}
            </ReactMarkdown>
          </div>
        )}
      </main>
    </OnlyOwner>
  );
}
