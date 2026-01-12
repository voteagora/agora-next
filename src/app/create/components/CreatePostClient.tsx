"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";
import { useEASV2 } from "@/hooks/useEASV2";
import { useDaoSettings } from "@/hooks/useDaoSettings";
import toast from "react-hot-toast";
import { PostTypeSelector } from "./PostTypeSelector";
import { CreatePostForm } from "./CreatePostForm";
import { ProposalSettingsCard } from "./ProposalSettingsCard";
import { useForumPermissionsContext } from "@/contexts/ForumPermissionsContext";
import {
  canCreateTempCheck as canCreateTempCheckUtil,
  canCreateGovernanceProposal as canCreateGovernanceProposalUtil,
} from "@/lib/forumPermissionUtils";
import { useHasTownsNFT } from "@/hooks/useHasTownsNFT";
import {
  PostType,
  postTypeOptions,
  ProposalType,
  CreatePostFormData,
  RelatedItem,
  EASVotingType,
  ApprovalProposalSettings,
  defaultApprovalSettings,
} from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CreatePostClientProps {
  initialPostType: PostType;
  initialFormData: Partial<CreatePostFormData>;
  proposalTypes: ProposalType[];
}

export function CreatePostClient({
  initialPostType,
  initialFormData,
  proposalTypes,
}: CreatePostClientProps) {
  const { address } = useAccount();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { ui, contracts } = Tenant.current();
  const { createProposalWithVotingType } = useEASV2();
  const permissions = useForumPermissionsContext();
  const { data: daoSettings } = useDaoSettings(contracts.easRecipient);

  const hasInitialTempCheck =
    (initialFormData.relatedTempChecks?.length || 0) > 0;

  const [selectedPostType, setSelectedPostType] =
    useState<PostType>(initialPostType);

  const [selectedProposalType, setSelectedProposalType] =
    useState<ProposalType>(proposalTypes[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIndexingModal, setShowIndexingModal] = useState(false);

  // Voting type state
  const [selectedVotingType, setSelectedVotingType] =
    useState<EASVotingType>("standard");
  const [approvalSettings, setApprovalSettings] =
    useState<ApprovalProposalSettings>(defaultApprovalSettings);

  const form = useForm<CreatePostFormData>({
    defaultValues: initialFormData,
  });

  const isEASV2Enabled = ui.toggle("easv2-govlessvoting")?.enabled;
  // Check if extended voting types are enabled for this tenant
  const isExtendedVotingEnabled = ui.toggle("easv2-extended-voting")?.enabled;

  const relatedTempChecks = form.watch("relatedTempChecks") || [];
  const canCreateTempCheck = canCreateTempCheckUtil(permissions);
  const isAuthorOfTempChecks = relatedTempChecks.every(
    (tc) => tc.proposer?.toLowerCase() === address?.toLowerCase()
  );
  const { hasNFT: hasTownsNFT } = useHasTownsNFT();
  const canCreateGovernanceProposal = canCreateGovernanceProposalUtil(
    permissions,
    relatedTempChecks,
    isAuthorOfTempChecks,
    hasTownsNFT
  );
  const currentVP = parseInt(permissions.currentVP) || 0;
  const requiredVP = permissions.settings?.minVpForProposals || 0;

  const handleSubmit = async () => {
    if (!address) return;

    const data = form.getValues();
    setIsSubmitting(true);

    try {
      if (!isEASV2Enabled) return;

      const isTempCheck = selectedPostType === "tempcheck";
      const getTempcheckOverrideSeconds = (): number | undefined => {
        const raw = (daoSettings as any)?.tempcheck_voting_period as
          | string
          | undefined;
        if (!raw) return undefined;
        const parsed = parseInt(raw, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
      };
      const tempcheckOverrideSeconds = getTempcheckOverrideSeconds();

      const votingPeriodSeconds =
        isTempCheck && tempcheckOverrideSeconds
          ? tempcheckOverrideSeconds
          : daoSettings?.votingPeriod || 7 * 24 * 60 * 60;
      const votingDelaySeconds = daoSettings?.votingDelay || 0;

      const relatedLinks = [
        ...(data.relatedDiscussions || []).map((d) => d.id),
        ...(data.relatedTempChecks || []).map((t) => t.id),
      ].filter((url): url is string => !!url);

      const tagsArray = [selectedPostType, ...relatedLinks];
      const tagsString = tagsArray.join(",");

      await createProposalWithVotingType({
        title: data.title,
        description: data.description,
        startts: BigInt(Math.floor(Date.now() / 1000) + votingDelaySeconds),
        endts: BigInt(
          Math.floor(
            (Date.now() +
              votingDelaySeconds * 1000 +
              votingPeriodSeconds * 1000) /
              1000
          )
        ),
        tags: tagsString,
        proposal_type_uid: selectedProposalType.id || undefined,
        votingType: selectedVotingType,
        choices:
          selectedVotingType === "approval"
            ? approvalSettings.choices.map((c) => c.title)
            : [],
        maxApprovals:
          selectedVotingType === "approval" ? approvalSettings.maxApprovals : 1,
        criteria:
          selectedVotingType === "approval"
            ? approvalSettings.criteria
            : "threshold",
        criteriaValue:
          selectedVotingType === "approval"
            ? approvalSettings.criteriaValue
            : 0,
        budget: selectedVotingType === "approval" ? approvalSettings.budget : 0,
      });

      await queryClient.invalidateQueries({ queryKey: ["forumTopics"] });

      toast.success(
        `${selectedPostType === "tempcheck" ? "Temp check" : "Governance proposal"} created successfully!`
      );
      setShowIndexingModal(true);
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create post"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeSelectedVotingType = (type: EASVotingType) => {
    setSelectedVotingType(type);
    const filteredProposalsTypes = proposalTypes.filter(
      (pType) => pType.module?.toLowerCase() === type.toLowerCase()
    );

    setSelectedProposalType(filteredProposalsTypes[0]);
  };

  const handleAddRelatedItem =
    (field: "relatedDiscussions" | "relatedTempChecks") =>
    (item: RelatedItem) => {
      const current = form.getValues(field) || [];
      form.setValue(field, [...current, item]);
    };

  const handleRemoveRelatedItem =
    (field: "relatedDiscussions" | "relatedTempChecks") => (id: string) => {
      const current = form.getValues(field) || [];
      form.setValue(
        field,
        current.filter((d) => d.id !== id)
      );
    };

  const handleRemoveAllRelatedItems = () => {
    form.setValue("relatedDiscussions", []);
    form.setValue("relatedTempChecks", []);
  };

  const handleProposalTypeChange = (typeId: string) => {
    const type = proposalTypes.find((t) => t.id === typeId);
    setSelectedProposalType(type || proposalTypes[0]);
    form.setValue("proposalTypeId", typeId);
  };

  const handleCloseIndexingModal = () => {
    setShowIndexingModal(false);
    router.push("/");
  };

  useEffect(() => {
    if (proposalTypes.length > 0 && !selectedProposalType) {
      setSelectedProposalType(proposalTypes[0]);
    }
  }, [proposalTypes, selectedProposalType]);

  useEffect(() => {
    if (selectedPostType === "gov-proposal" && relatedTempChecks.length > 0) {
      const tempCheck = relatedTempChecks[0];
      if (tempCheck.proposalType) {
        setSelectedProposalType(tempCheck.proposalType);

        // Automatically set voting type based on temp check's proposal type class
        if (tempCheck.proposalType.type) {
          const proposalClass = tempCheck.proposalType.type.toUpperCase();
          if (proposalClass === "OPTIMISTIC") {
            setSelectedVotingType("optimistic");
          } else if (proposalClass === "APPROVAL") {
            setSelectedVotingType("approval");
          } else if (proposalClass === "STANDARD") {
            setSelectedVotingType("standard");
          }
        }
      }
    }
  }, [relatedTempChecks, selectedPostType]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-primary">
            Create {postTypeOptions[selectedPostType].toLowerCase()}
          </h1>
          <PostTypeSelector
            value={selectedPostType}
            onChange={setSelectedPostType}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <CreatePostForm
            form={form}
            postType={selectedPostType}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            canCreateTempCheck={canCreateTempCheck}
            canCreateGovernanceProposal={canCreateGovernanceProposal}
            currentVP={currentVP}
            requiredVP={requiredVP}
            hasInitialTempCheck={hasInitialTempCheck}
            hasTownsNFT={hasTownsNFT}
            onAddRelatedDiscussion={handleAddRelatedItem("relatedDiscussions")}
            onRemoveRelatedDiscussion={handleRemoveRelatedItem(
              "relatedDiscussions"
            )}
            onAddRelatedTempCheck={handleAddRelatedItem("relatedTempChecks")}
            onRemoveRelatedTempCheck={handleRemoveRelatedItem(
              "relatedTempChecks"
            )}
            onRemoveRelatedItems={handleRemoveAllRelatedItems}
            // Voting type settings - now in the form
            showVotingTypeSettings={isExtendedVotingEnabled}
            selectedVotingType={selectedVotingType}
            onVotingTypeChange={changeSelectedVotingType}
            approvalSettings={approvalSettings}
            onApprovalSettingsChange={setApprovalSettings}
          />
        </div>

        <div className="space-y-6">
          <ProposalSettingsCard
            selectedProposalType={selectedProposalType}
            proposalTypes={proposalTypes}
            onProposalTypeChange={handleProposalTypeChange}
            postType={selectedPostType}
            isGovProposal={
              selectedPostType === "gov-proposal" &&
              relatedTempChecks.length > 0
            }
            relatedTempChecks={relatedTempChecks}
            selectedVotingType={selectedVotingType}
          />
        </div>
      </div>

      <Dialog open={showIndexingModal} onOpenChange={setShowIndexingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Created Successfully</DialogTitle>
            <DialogDescription>
              Your{" "}
              {selectedPostType === "tempcheck"
                ? "temp check"
                : "governance proposal"}{" "}
              has been submitted to the blockchain. It may take a couple of
              minutes for the data to be indexed and appear.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseIndexingModal}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
