"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import toast from "react-hot-toast";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { ForumCategory } from "@/lib/forumUtils";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/20/solid";
import AgoraLoader from "../shared/AgoraLoader/AgoraLoader";

interface CategoriesManagerProps {
  initialCategories: ForumCategory[];
}

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  adminOnlyTopics: z.boolean().default(false),
});

const CategoriesManager = ({ initialCategories }: CategoriesManagerProps) => {
  const [categories, setCategories] = useState<ForumCategory[]>(
    initialCategories.filter((cat) => cat.name !== "DUNA")
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(
    null
  );

  const createForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      adminOnlyTopics: false,
    },
  });

  const editForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      adminOnlyTopics: false,
    },
  });

  const {
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    archiveCategory,
  } = useForum();

  const { isAdmin, isLoading } = useForumAdmin();

  const refreshCategories = async () => {
    const fetchedCategories = await fetchCategories();
    setCategories(fetchedCategories.filter((cat) => cat.name !== "DUNA"));
  };

  const handleCreateCategory = async (
    data: z.infer<typeof categoryFormSchema>
  ) => {
    const result = await createCategory({
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      adminOnlyTopics: data.adminOnlyTopics,
    });

    if (result) {
      createForm.reset();
      setIsCreateDialogOpen(false);
      await refreshCategories();
    }
  };

  const handleUpdateCategory = async (
    data: z.infer<typeof categoryFormSchema>
  ) => {
    if (!editingCategory) {
      toast.error("No category selected for editing");
      return;
    }

    const result = await updateCategory(editingCategory.id, {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      adminOnlyTopics: data.adminOnlyTopics,
    });

    if (result) {
      editForm.reset();
      setEditingCategory(null);
      setIsEditDialogOpen(false);
      await refreshCategories();
    }
  };

  const handleEditClick = (category: ForumCategory) => {
    setEditingCategory(category);
    editForm.reset({
      name: category.name,
      description: category.description || "",
      adminOnlyTopics: category.adminOnlyTopics,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      return;
    }

    const success = await deleteCategory(categoryId);
    if (success) {
      await refreshCategories();
    }
  };

  const handleArchiveCategory = async (categoryId: number) => {
    if (!confirm("Are you sure you want to archive this category?")) {
      return;
    }

    const success = await archiveCategory(categoryId);
    if (success) {
      await refreshCategories();
    }
  };

  const resetCreateForm = () => {
    createForm.reset();
  };

  const resetEditForm = () => {
    editForm.reset();
    setEditingCategory(null);
  };

  if (isLoading) {
    return <AgoraLoader />;
  }

  if (!isAdmin) {
    return (
      <div className="mt-12 text-center">
        <p className="text-tertiary">
          You don&apos;t have permission to manage forum categories.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-primary">
          Category Management
        </h1>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetCreateForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(handleCreateCategory)}
                className="space-y-4"
              >
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Category description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="adminOnlyTopics"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="flex flex-col gap-1">
                        <div className="space-y-1 leading-none">
                          <FormLabel>Admin-only topics</FormLabel>
                        </div>
                        <FormDescription>
                          If enabled, only admins can create topics in this
                          category.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Create
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-line bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary">Categories</h2>
            <Badge variant="secondary">{categories.length} categories</Badge>
          </div>

          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-wash rounded-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-primary">
                      {category.name}
                    </h3>
                    {category.adminOnlyTopics && (
                      <Badge variant="secondary" className="text-xs">
                        Admin Only
                      </Badge>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-tertiary mt-1">
                      {category.description}
                    </p>
                  )}
                  <p className="text-xs text-tertiary mt-1">
                    Created: {new Date(category.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(category)}
                    disabled={loading}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleArchiveCategory(category.id)}
                    disabled={loading}
                  >
                    <ArchiveBoxIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={loading}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <p className="text-tertiary text-center py-8">
              No categories found. Create your first category to get started.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) resetEditForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdateCategory)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Category description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="adminOnlyTopics"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="flex flex-col gap-1">
                      <div className="space-y-1 leading-none">
                        <FormLabel>Admin-only topics</FormLabel>
                      </div>
                      <FormDescription>
                        If enabled, only admins can create topics in this
                        category.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  Update
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesManager;
