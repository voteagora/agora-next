"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface SoftDeletedContentProps {
  contentType: "post" | "topic" | "comment";
  deletedAt: string;
  deletedBy: string;
  canRestore?: boolean;
  onRestore?: () => void;
  showRestoreButton?: boolean;
}

const SoftDeletedContent: React.FC<SoftDeletedContentProps> = ({
  contentType,
  deletedAt,
  deletedBy,
  canRestore = false,
  onRestore,
  showRestoreButton = false,
}) => {
  const contentTypeLabel = contentType === "comment" ? "reply" : contentType;

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 italic">
            [User has deleted this {contentTypeLabel}]
          </span>
          {showRestoreButton && (
            <span className="text-xs text-gray-400">
              Deleted by {deletedBy} on{" "}
              {new Date(deletedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {canRestore && showRestoreButton && onRestore && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRestore}
            className="ml-2"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Restore
          </Button>
        )}
      </div>
    </div>
  );
};

export default SoftDeletedContent;
