"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useForum } from "@/hooks/useForum";
import { useForumCategories } from "@/hooks/useForumCategories";
import { buildForumTopicPath } from "@/lib/forumUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import MarkdownTextareaInput from "@/app/proposals/draft/components/form/MarkdownTextareaInput";
import { CommunityGuidelinesCard } from "@/app/create/components/CommunityGuidelinesCard";
import toast from "react-hot-toast";
import { InsufficientVPModal } from "@/components/Forum/InsufficientVPModal";

interface FormData {
  title: string;
  description: string;
  categoryId?: number;
}

export default function NewForumTopicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createTopic, checkVPBeforeAction } = useForum();
  const { categories } = useForumCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVPModal, setShowVPModal] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      categoryId: undefined,
    },
  });

  useEffect(() => {
    const title = searchParams?.get("title");
    const description = searchParams?.get("description");

    if (title) {
      form.setValue("title", title);
    }
    if (description) {
      form.setValue("description", description);
    }
  }, [searchParams, form]);

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
        toast.success("Forum topic created successfully!");
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-8">Create new topic</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="space-y-6 mt-4">
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
                  This will post on the forums
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
  );
}
