import { UpdatedButton } from "@/components/Button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  closeDialog: () => void;
  className?: string;
}

export function ConfirmDialog({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  closeDialog,
  className,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    closeDialog();
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center w-full bg-neutral max-w-[28rem]",
        className
      )}
    >
      <div className="flex flex-col gap-6 justify-center min-h-[200px] w-full">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-left text-primary">{title}</h2>
          <p className="text-secondary">{message}</p>
          <div className="flex flex-col gap-3">
            <UpdatedButton
              onClick={handleConfirm}
              type={variant === "danger" ? "secondary" : "primary"}
              className={
                variant === "danger"
                  ? "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                  : ""
              }
            >
              {confirmText}
            </UpdatedButton>
            <Button onClick={closeDialog} variant="outline">
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
