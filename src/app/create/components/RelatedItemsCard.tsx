import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RelatedItem, PostType } from "../types";
import { RelatedItemsSection } from "./RelatedItemsSection";

interface RelatedItemsCardProps {
  postType: PostType;
  relatedDiscussions: RelatedItem[];
  relatedTempChecks: RelatedItem[];
  onAddRelatedDiscussion: (item: RelatedItem) => void;
  onRemoveRelatedDiscussion: (id: string) => void;
  onAddRelatedTempCheck: (item: RelatedItem) => void;
  onRemoveRelatedTempCheck: (id: string) => void;
  onRemoveCard: () => void;
}

export function RelatedItemsCard({
  postType,
  relatedDiscussions,
  relatedTempChecks,
  onAddRelatedDiscussion,
  onRemoveRelatedDiscussion,
  onAddRelatedTempCheck,
  onRemoveRelatedTempCheck,
  onRemoveCard,
}: RelatedItemsCardProps) {
  const showTempChecks = postType === "gov-proposal";
  const hasSelectedItems =
    relatedDiscussions.length > 0 || relatedTempChecks.length > 0;

  return (
    <Card className="relative">
      <CardContent className="mt-4">
        <div className="space-y-6">
          <RelatedItemsSection
            label="Related Discussions"
            items={relatedDiscussions}
            onAdd={onAddRelatedDiscussion}
            onRemove={onRemoveRelatedDiscussion}
            searchType="forum"
          />
        </div>

        {showTempChecks && (
          <>
            <div className="border-t my-6 -mx-6" />
            <div className="space-y-6">
              <RelatedItemsSection
                label="Related Temp Check"
                items={relatedTempChecks}
                onAdd={onAddRelatedTempCheck}
                onRemove={onRemoveRelatedTempCheck}
                searchType="tempcheck"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
