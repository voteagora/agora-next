import { UseFormReturn, FormProvider } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  CreatePostFormData,
  PostType,
  RelatedItem,
  EASVotingType,
  ApprovalProposalSettings,
} from "../types";
import { RelatedItemsCard } from "./RelatedItemsCard";
import { VotingTypeSelector } from "./VotingTypeSelector";
import { ApprovalOptionsInput } from "./ApprovalOptionsInput";
import { OptimisticSettingsInput } from "./OptimisticSettingsInput";
import MarkdownTextareaInput from "@/app/proposals/draft/components/form/MarkdownTextareaInput";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";

interface CreatePostFormProps {
  form: UseFormReturn<CreatePostFormData>;
  postType: PostType;
  onSubmit: () => void;
  isSubmitting: boolean;
  canCreateTempCheck: boolean;
  canCreateGovernanceProposal: boolean;
  currentVP: number;
  requiredVP: number;
  hasInitialTempCheck: boolean;
  hasTownsNFT?: boolean;
  onAddRelatedDiscussion: (item: RelatedItem) => void;
  onRemoveRelatedDiscussion: (id: string) => void;
  onAddRelatedTempCheck: (item: RelatedItem) => void;
  onRemoveRelatedTempCheck: (id: string) => void;
  onRemoveRelatedItems: () => void;
  // Voting type props
  showVotingTypeSettings?: boolean;
  selectedVotingType: EASVotingType;
  onVotingTypeChange: (type: EASVotingType) => void;
  approvalSettings: ApprovalProposalSettings;
  onApprovalSettingsChange: (settings: ApprovalProposalSettings) => void;
}

export function CreatePostForm({
  form,
  postType,
  onSubmit,
  isSubmitting,
  canCreateTempCheck,
  canCreateGovernanceProposal,
  currentVP,
  requiredVP,
  hasInitialTempCheck,
  hasTownsNFT,
  onAddRelatedDiscussion,
  onRemoveRelatedDiscussion,
  onAddRelatedTempCheck,
  onRemoveRelatedTempCheck,
  onRemoveRelatedItems,
  showVotingTypeSettings = false,
  selectedVotingType,
  onVotingTypeChange,
  approvalSettings,
  onApprovalSettingsChange,
}: CreatePostFormProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const relatedDiscussions = watch("relatedDiscussions") || [];
  const relatedTempChecks = watch("relatedTempChecks") || [];
  const title = watch("title");
  const description = watch("description");

  return (
    <FormProvider {...form}>
      <Card>
        <CardContent className="space-y-6 mt-4">
          {/* Voting Type Selection - At the top */}
          {showVotingTypeSettings && (
            <div className="pb-6 border-b border-line">
              <VotingTypeSelector
                value={selectedVotingType}
                onChange={onVotingTypeChange}
              />
            </div>
          )}

          {/* Title */}
          <div>
            <Label
              className="text-xs font-semibold text-secondary"
              htmlFor="title"
            >
              Title
            </Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="Add new appchain to Syndicate"
              className="mt-2"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description / Body */}
          <div>
            <div className="mt-2">
              <MarkdownTextareaInput
                control={form.control}
                label="Body"
                name="description"
                required={true}
              />
            </div>
          </div>

          {/* Voting Type Specific Settings - In the form body */}
          {showVotingTypeSettings && selectedVotingType === "approval" && (
            <div className="pt-6 border-t border-line">
              <ApprovalOptionsInput
                settings={approvalSettings}
                onChange={onApprovalSettingsChange}
              />
            </div>
          )}

          {/* Related Items */}
          <RelatedItemsCard
            postType={postType}
            relatedDiscussions={relatedDiscussions}
            relatedTempChecks={relatedTempChecks}
            onAddRelatedDiscussion={onAddRelatedDiscussion}
            onRemoveRelatedDiscussion={onRemoveRelatedDiscussion}
            onAddRelatedTempCheck={onAddRelatedTempCheck}
            onRemoveRelatedTempCheck={onRemoveRelatedTempCheck}
            onRemoveCard={onRemoveRelatedItems}
          />

          {/* Submit Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between pt-6 border-t">
            <div className="text-sm text-gray-500">
              {postType === "tempcheck" && (
                <div>
                  {canCreateTempCheck ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckIcon className="h-4 w-4" />
                      You can create temp checks
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <XMarkIcon className="h-4 w-4" />
                      Insufficient voting power
                    </span>
                  )}
                  <div className="text-xs mt-1">
                    {`${currentVP.toLocaleString()} / ${requiredVP.toLocaleString()} voting power`}
                  </div>
                </div>
              )}
              {postType === "gov-proposal" && (
                <div>
                  {hasTownsNFT ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckIcon className="h-4 w-4" />
                      You are authorized to create proposal as a Towns Node
                      Operator
                    </span>
                  ) : !relatedTempChecks?.length ? (
                    <span className="text-secondary flex items-center gap-1">
                      <XMarkIcon className="h-4 w-4" />
                      Select a successful temp check to continue
                    </span>
                  ) : canCreateGovernanceProposal ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckIcon className="h-4 w-4" />
                      You are authorized to create proposal
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <XMarkIcon className="h-4 w-4" />
                      Only admins or temp check authors can create governance
                      proposals
                    </span>
                  )}
                  {!hasTownsNFT && relatedTempChecks?.length > 0 && (
                    <div className="text-xs mt-1">
                      {relatedTempChecks.some((tc) => tc.status === "SUCCEEDED")
                        ? "You are the author of this temp check"
                        : "Referenced temp check must be approved"}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end mt-2 lg:mt-0">
              <Button
                onClick={onSubmit}
                disabled={
                  isSubmitting ||
                  !title?.trim() ||
                  !description?.trim() ||
                  (postType === "tempcheck" && !canCreateTempCheck) ||
                  (postType === "gov-proposal" && !canCreateGovernanceProposal)
                }
                className="bg-black text-white hover:bg-gray-800"
              >
                {isSubmitting
                  ? "Creating..."
                  : postType === "tempcheck"
                    ? "Create temp check"
                    : "Create Proposal"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
