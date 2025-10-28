"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";
import { useEASV2 } from "@/hooks/useEASV2";
import { useForum } from "@/hooks/useForum";
import { useForumCategories } from "@/hooks/useForumCategories";
import { useDaoSettings } from "@/hooks/useDaoSettings";
import { createProposalLinks } from "@/lib/actions/proposalLinks";
import toast from "react-hot-toast";
import { buildForumTopicPath } from "@/lib/forumUtils";
import { PostTypeSelector } from "./PostTypeSelector";
import { CreatePostForm } from "./CreatePostForm";
import { ProposalSettingsCard } from "./ProposalSettingsCard";
import { CommunityGuidelinesCard } from "./CommunityGuidelinesCard";
import { useForumPermissionsContext } from "@/contexts/ForumPermissionsContext";
import {
  canCreateTempCheck as canCreateTempCheckUtil,
  canCreateGovernanceProposal as canCreateGovernanceProposalUtil,
} from "@/lib/forumPermissionUtils";
import {
  PostType,
  postTypeOptions,
  ProposalType,
  CreatePostFormData,
  RelatedItem,
} from "../types";

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
  const { ui, slug, contracts } = Tenant.current();
  const { createProposal } = useEASV2();
  const { createTopic } = useForum();
  const { categories } = useForumCategories();
  const permissions = useForumPermissionsContext();
  const { data: daoSettings } = useDaoSettings(contracts.easRecipient);

  const [selectedPostType, setSelectedPostType] =
    useState<PostType>(initialPostType);

  const [selectedProposalType, setSelectedProposalType] =
    useState<ProposalType>(proposalTypes[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreatePostFormData>({
    defaultValues: initialFormData,
  });

  const isEASV2Enabled = ui.toggle("easv2-govlessvoting")?.enabled;

  const relatedTempChecks = form.watch("relatedTempChecks") || [];
  const canCreateTempCheck = canCreateTempCheckUtil(permissions);
  const canCreateGovernanceProposal = canCreateGovernanceProposalUtil(
    permissions,
    relatedTempChecks.length > 0
  );
  const currentVP = parseInt(permissions.currentVP) || 0;
  const requiredVP = permissions.settings?.minVpForProposals || 0;
  const isAdmin = permissions.isAdmin;

  const handleSubmit = async () => {
    if (!address) return;

    const data = form.getValues();
    setIsSubmitting(true);

    try {
      if (selectedPostType === "forum-post") {
        const created = await createTopic({
          title: data.title.trim(),
          content: data.description.trim(),
          categoryId: data.categoryId,
        });

        if (created?.id) {
          toast.success("Forum post created successfully!");
          router.push(buildForumTopicPath(created.id, created.title));
        }
      } else if (
        selectedPostType === "tempcheck" ||
        selectedPostType === "gov-proposal"
      ) {
        if (!isEASV2Enabled) return;

        const votingPeriodSeconds =
          daoSettings?.votingPeriod || 7 * 24 * 60 * 60;
        const votingDelaySeconds = daoSettings?.votingDelay || 0;

        const proposal = await createProposal({
          title: data.title,
          description: data.description,
          startts: BigInt(Math.floor(Date.now() / 1000) + votingDelaySeconds),
          endts: BigInt(
            Math.floor((Date.now() + votingPeriodSeconds * 1000) / 1000)
          ),
          tags: selectedPostType,
          proposal_type_uid: selectedProposalType.id || undefined,
        });

        const target = proposal.transactionHash;

        const targetType =
          selectedPostType === "tempcheck" ? "tempcheck" : "gov";
        const allLinks = [
          ...(data.relatedDiscussions || []).map((d) => ({
            sourceId: d.id,
            sourceType: "forum_topic",
            targetId: target,
            targetType,
          })),
          ...(data.relatedTempChecks || []).map((t) => ({
            sourceId: t.id,
            sourceType: "tempcheck",
            targetId: target,
            targetType,
          })),
        ];

        if (allLinks.length > 0) {
          allLinks.forEach((link) =>
            createProposalLinks({
              sourceId: link.sourceId,
              sourceType: link.sourceType,
              links: [{ targetId: link.targetId, targetType: link.targetType }],
            }).catch(() => {})
          );
        }

        await queryClient.invalidateQueries({ queryKey: ["forumTopics"] });

        toast.success(
          `${selectedPostType === "tempcheck" ? "Temp check" : "Governance proposal"} created successfully!`
        );
        router.push("/forums");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create post"
      );
    } finally {
      setIsSubmitting(false);
    }
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

  useEffect(() => {
    if (proposalTypes.length > 0 && !selectedProposalType) {
      setSelectedProposalType(proposalTypes[0]);
    }
  }, [proposalTypes, selectedProposalType]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">
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
            isAdmin={isAdmin}
            categories={categories}
            onAddRelatedDiscussion={handleAddRelatedItem("relatedDiscussions")}
            onRemoveRelatedDiscussion={handleRemoveRelatedItem(
              "relatedDiscussions"
            )}
            onAddRelatedTempCheck={handleAddRelatedItem("relatedTempChecks")}
            onRemoveRelatedTempCheck={handleRemoveRelatedItem(
              "relatedTempChecks"
            )}
            onRemoveRelatedItems={handleRemoveAllRelatedItems}
          />
        </div>

        <div className="space-y-6">
          {(selectedPostType === "tempcheck" ||
            selectedPostType === "gov-proposal") && (
            <ProposalSettingsCard
              selectedProposalType={selectedProposalType}
              proposalTypes={proposalTypes}
              onProposalTypeChange={handleProposalTypeChange}
              postType={selectedPostType}
            />
          )}

          {selectedPostType === "forum-post" && <CommunityGuidelinesCard />}
        </div>
      </div>
    </div>
  );
}
