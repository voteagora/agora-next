"use client";

import React, { useState } from "react";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import { ArrowUpIcon } from "@heroicons/react/20/solid";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { ForumCategory } from "@/lib/forumUtils";
import { toast } from "react-hot-toast";

interface ArchivedCategoryCardProps {
  category: ForumCategory;
  onUnarchive?: () => void;
  isLast?: boolean;
}

const ArchivedCategoryCard = ({
  category,
  onUnarchive,
  isLast,
}: ArchivedCategoryCardProps) => {
  const { address } = useAccount();
  const { unarchiveCategory } = useForum();
  const openDialog = useOpenDialog();
  const { isAdmin } = useForumAdmin();

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAdmin) {
      toast.error("Only forum admins can unarchive categories.");
      return;
    }

    openDialog({
      type: "CONFIRM",
      params: {
        title: "Unarchive Category",
        message: `Are you sure you want to unarchive the category "${category.name}"?`,
        onConfirm: async () => {
          const success = await unarchiveCategory(category.id);
          if (success && onUnarchive) {
            onUnarchive();
          }
        },
      },
    });
  };

  return (
    <div
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        !isLast ? "border-b border-line" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-bold text-primary text-base">
              {category.name}
            </h5>
          </div>
          {category.description && (
            <p className="text-sm text-secondary mb-1">
              {category.description}
            </p>
          )}
          <p className="text-xs text-tertiary">
            Created {new Date(category.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary sm:ml-4">
          <button
            onClick={handleUnarchive}
            className={`p-1 transition-colors ${
              isAdmin
                ? "text-blue-500 hover:text-blue-700"
                : "text-gray-400 cursor-not-allowed"
            }`}
            title={
              isAdmin ? "Unarchive category" : "Only forum admins can unarchive"
            }
            disabled={!isAdmin}
          >
            <ArrowUpIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-tertiary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span>
              {category.adminOnlyTopics ? "Admin-only topics" : "Public topics"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ArchivedCategoriesSectionProps {
  initialCategories: ForumCategory[];
}

const ArchivedCategoriesSection = ({
  initialCategories,
}: ArchivedCategoriesSectionProps) => {
  const [categories, setCategories] = useState<ForumCategory[]>(
    initialCategories || []
  );
  const { loading } = useForum();

  const handleUnarchiveCategory = (categoryToUnarchive: ForumCategory) => {
    setCategories((prev) =>
      prev.filter((category) => category.id !== categoryToUnarchive.id)
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h4 className="text-lg font-bold text-primary">Archived Categories</h4>
        <div className="text-sm text-secondary">
          {categories.length} archived categor
          {categories.length !== 1 ? "ies" : "y"}
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="text-secondary">Loading archived categories...</div>
        </div>
      )}

      {categories.length === 0 && (
        <div className="text-center py-8">
          <div className="text-secondary">No archived categories found.</div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="border rounded-lg bg-white border-line">
          {categories.map((category, index) => (
            <ArchivedCategoryCard
              key={category.id}
              category={category}
              onUnarchive={() => handleUnarchiveCategory(category)}
              isLast={index === categories.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedCategoriesSection;
