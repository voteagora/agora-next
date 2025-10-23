import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RelatedItem } from "../types";
import { Search, MessageSquare, Calendar, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { stripHtmlToText } from "@/app/forums/stripHtml";

interface RelatedItemsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  searchType: "forum" | "tempcheck";
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  results: RelatedItem[];
  isLoading: boolean;
  onSearch: () => void;
  onSelect: (item: RelatedItem) => void;
  existingItemIds: string[];
  page?: number;
  totalPages?: number;
  totalResults?: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

export function RelatedItemsDialog({
  isOpen,
  onOpenChange,
  searchType,
  searchTerm,
  onSearchTermChange,
  results,
  isLoading,
  onSearch,
  onSelect,
  existingItemIds,
  page = 1,
  totalPages = 1,
  totalResults = 0,
  onNextPage,
  onPrevPage,
}: RelatedItemsDialogProps) {
  const isAlreadySelected = (id: string) => existingItemIds.includes(id);
  const showPagination = totalPages > 1;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search {searchType === "forum" ? "Forum Posts" : "Temp Checks"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search ${searchType === "forum" ? "forum posts" : "temp checks"}...`}
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="pl-9"
              autoFocus
            />
          </div>

          <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-black rounded-full" />
                  <p className="text-sm text-gray-500">Searching...</p>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {searchTerm ? "No results found" : "Enter a search term to find posts"}
                </p>
              </div>
            ) : (
              results.map((item) => {
                const selected = isAlreadySelected(item.id);
                return (
                  <div
                    key={item.id}
                    className={`
                      relative p-3 border rounded-lg transition-all
                      ${selected 
                        ? "bg-green-50 border-green-200 cursor-not-allowed" 
                        : "cursor-pointer hover:bg-gray-50 hover:border-gray-300"
                      }
                    `}
                    onClick={() => !selected && onSelect(item)}
                  >
                    {selected && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-600 text-white flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Added
                        </Badge>
                      </div>
                    )}
                    <p className="font-medium text-sm leading-tight mb-1 pr-20">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {stripHtmlToText(item.description)}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
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
                );
              })
            )}
          </div>

          {results.length > 0 && (
            <div className="border-t pt-3 space-y-2">
              {showPagination && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Showing {((page - 1) * 20) + 1}-{Math.min(page * 20, totalResults)} of {totalResults} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onPrevPage}
                      disabled={page === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-gray-600">
                      {page} / {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onNextPage}
                      disabled={page === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 text-center">
                Click on an item to add it as a reference
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

