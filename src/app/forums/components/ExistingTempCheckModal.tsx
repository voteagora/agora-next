"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Tenant from "@/lib/tenant/tenant";

interface ExistingTempCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewTempCheck: () => void;
  onCreateNew: () => void;
}

export function ExistingTempCheckModal({
  isOpen,
  onClose,
  onViewTempCheck,
  onCreateNew,
}: ExistingTempCheckModalProps) {
  const { ui } = Tenant.current();
  const copy = ui.copy;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogTitle className="text-xl font-bold text-primary">
            {copy.forums.existingTempCheckTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-secondary">
            {copy.forums.existingTempCheckDescription}
          </p>

          <div className="flex flex-col gap-3">
            <Button onClick={onViewTempCheck} size="lg" className="w-full">
              {copy.forums.viewTempCheck}
            </Button>
            <Button
              onClick={onCreateNew}
              size="lg"
              variant="outline"
              className="w-full"
            >
              {copy.forums.createNewTempCheck}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
