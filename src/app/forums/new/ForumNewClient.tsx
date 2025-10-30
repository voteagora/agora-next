"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { useForum } from "@/hooks/useForum";
import { useForumCategories } from "@/hooks/useForumCategories";
import { buildForumTopicPath } from "@/lib/forumUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import MarkdownTextareaInput from "@/app/proposals/draft/components/form/MarkdownTextareaInput";
import { CommunityGuidelinesCard } from "@/app/create/components/CommunityGuidelinesCard";
import toast from "react-hot-toast";
import { InsufficientVPModal } from "@/components/Forum/InsufficientVPModal";
import { createProposalLinks } from "@/lib/actions/proposalLinks";
import { useForumPermissionsContext } from "@/contexts/ForumPermissionsContext";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { ExternalLink, FileText, Thermometer, Clock } from "lucide-react";
import { formatRelative } from "@/components/ForumShared/utils";

export interface FormData {
  title: string;
  description: string;
  categoryId?: number;
}

export interface RelatedProposal {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

interface ForumNewClientProps {
  initialFormData: FormData;
  relatedProposal?: RelatedProposal;
}

export default function ForumNewClient({
  initialFormData,
  relatedProposal,
}: ForumNewClientProps) {
  const router = useRouter();
  const { createTopic, checkVPBeforeAction } = useForum();
  const { categories } = useForumCategories();
  const permissions = useForumPermissionsContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVPModal, setShowVPModal] = useState(false);

  const form = useForm<FormData>({
    defaultValues: initialFormData,
  });

  const {
    register,
    handleSubmit: hookFormHandleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const title = watch("title");
  const description = watch("description");
  const categoryId = watch("categoryId");

  const vpCheck = checkVPBeforeAction("topic");
  const currentVP = parseInt(permissions.currentVP) || 0;
  const requiredVP = permissions.settings?.minVpForTopics || 0;
  const isAdmin = permissions.isAdmin;

  const handleSubmit = hookFormHandleSubmit(async (data) => {
    const vpCheck = checkVPBeforeAction("topic");
    if (!vpCheck.canProceed) {
      setShowVPModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createTopic({
        title: data.title.trim(),
        content: data.description.trim(),
        categoryId: data.categoryId,
      });

      if (created?.id) {
        if (relatedProposal) {
          await createProposalLinks({
            sourceId: relatedProposal.id,
            sourceType: relatedProposal.type,
            links: [
              {
                targetId: created.id.toString(),
                targetType: "forum_topic",
              },
            ],
          }).catch((error) => {
            console.error("Failed to create proposal link:", error);
          });
        }

        toast.success("Forum topic created successfully! Redirecting...");
        router.push(buildForumTopicPath(created.id, created.title));
      }
    } catch (error) {
      console.error("Failed to create topic:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create topic"
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <FormProvider {...form}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-8">Create new topic</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            <Card>
              <CardContent className="space-y-6 mt-4">
                <div>
            {relatedProposal && (
              <Link
              href={`/proposals/${relatedProposal.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#e0e0e0] rounded-lg p-3 cursor-pointer block hover:bg-gray-50 transition-colors my-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-secondary">
                    {relatedProposal.type === "tempcheck" ? "Related Temp check" : "Related Proposal"}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-secondary" />
                </div>
              </div>
              <div className="flex items-start gap-1">
                <div className="h-6 w-6 flex-shrink-0 flex items-center justify-center rounded-lg bg-wash">
                  {relatedProposal.type === "tempcheck" ? (
                    <Thermometer className="w-4 h-4 text-secondary" strokeWidth={1.7} />
                  ) : (
                    <FileText className="w-4 h-4 text-secondary" strokeWidth={1.7} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-primary flex-1 min-w-0">
                      {relatedProposal.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-semibold text-secondary flex-shrink-0">
                      <div className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" strokeWidth={1.7} />
                        <span>{formatRelative(relatedProposal.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            )}
                  <Label
                    className="text-xs font-semibold text-secondary"
                    htmlFor="title"
                  >
                    Title
                  </Label>
                  <Input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    placeholder="Topic title"
                    className="mt-2"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    className="text-xs font-semibold text-secondary"
                    htmlFor="category"
                  >
                    Category
                  </Label>
                  <select
                    id="category"
                    value={categoryId || ""}
                    onChange={(e) =>
                      setValue(
                        "categoryId",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    disabled={isSubmitting}
                  >
                    <option value="">No category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

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

                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="text-sm text-gray-500">
                    {vpCheck.canProceed ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckIcon className="h-4 w-4" />
                        Topic creation permission
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <XMarkIcon className="h-4 w-4" />
                        Insufficient voting power
                      </span>
                    )}
                    <div className="text-xs mt-1">
                      {isAdmin && vpCheck.canProceed
                        ? "Admin permissions"
                        : `${currentVP.toLocaleString()} / ${requiredVP.toLocaleString()} voting power required`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={
                        isSubmitting || !title?.trim() || !description?.trim()
                      }
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {isSubmitting ? "Creating..." : "Create topic"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <CommunityGuidelinesCard />
          </div>
        </div>

        <InsufficientVPModal
          isOpen={showVPModal}
          onClose={() => setShowVPModal(false)}
          action="topic"
        />
      </div>
    </FormProvider>
  );
}

