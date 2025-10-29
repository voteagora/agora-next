import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, MessageSquare, Calendar, ExternalLink } from "lucide-react";
import { RelatedItem } from "../types";
import { RelatedItemsDialog } from "./RelatedItemsDialog";
import { stripHtmlToText } from "@/app/forums/stripHtml";
import Link from "next/link";
import Image from "next/image";
import Tenant from "@/lib/tenant/tenant";
import { useState } from "react";

interface RelatedItemsSectionProps {
  label: string;
  items: RelatedItem[];
  onAdd: (item: RelatedItem) => void;
  onRemove: (id: string) => void;
  searchType: "forum" | "tempcheck";
}

export function RelatedItemsSection({
  label,
  items,
  onAdd,
  onRemove,
  searchType,
}: RelatedItemsSectionProps) {
  const { ui } = Tenant.current();
  const [isOpen, setIsOpen] = useState(false);
  
  const isTempCheck = searchType === "tempcheck";
  const hasTempCheck = isTempCheck && items.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-xs font-semibold text-secondary">{label}</Label>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="group relative flex items-start gap-3">
            <Image
              src={ui.logo}
              alt="logo"
              width={40}
              height={40}
              className="h-10 w-10 mt-0.5 flex-shrink-0"
            />
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm leading-tight">
                    {item.title}
                  </p>
                  {item.url && (
                    <Link
                      href={item.url}
                      target="_blank"
                      className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {item.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {item.timestamp}
                  </span>
                </div>
              </div>
              {item.description && (
                <p className="text-xs text-gray-500 line-clamp-2">
                  {stripHtmlToText(item.description)}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="h-6 w-6 p-0 rounded-full border"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}

        {!hasTempCheck && (
          <Button variant="outline" onClick={() => setIsOpen(true)} className="w-full">
            + Add Reference
          </Button>
        )}
      </div>

      <RelatedItemsDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        searchType={searchType}
        onSelect={onAdd}
        existingItemIds={items.map((item) => item.id)}
      />
    </div>
  );
}
