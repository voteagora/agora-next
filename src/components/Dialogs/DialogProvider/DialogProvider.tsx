"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  FC,
} from "react";
import { dialogs, DialogType } from "./dialogs";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

const DialogContext = createContext<(dialog: DialogType | null) => void>(
  () => {}
);

type Props = {
  children: ReactNode;
};

const Modal: FC<
  {
    open: boolean;
    onClose: () => void;
    transparent: boolean | undefined;
    className?: string;
  } & Props
> = ({ open, children, onClose, transparent, className }) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={
            transparent
              ? "fixed top-0 right-0 bottom-0 left-0 flex flex-col items-center justify-center bg-black/50 z-[1000] p-0"
              : "fixed top-0 right-0 bottom-0 left-0 flex flex-col items-center justify-center bg-black/50 z-[1000] p-4"
          }
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.98, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              transparent
                ? "bg-transparent p-6 rounded-xl m-0 w-full sm:w-auto relative"
                : "border border-line bg-neutral p-6 rounded-xl m-0 z-[1100] shadow-newDefault w-full sm:w-[28rem] relative",
              className
            )}
          >
            <XMarkIcon
              className="h-5 w-5 text-secondary cursor-pointer absolute right-2 top-2"
              onClick={onClose}
            />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const DialogProvider: FC<Props> = ({ children }) => {
  const [currentDialog, setCurrentDialog] = useState<DialogType | null>(null);

  const renderedDialog =
    currentDialog &&
    dialogs[currentDialog.type](currentDialog.params as any, () =>
      setCurrentDialog(null)
    );

  return (
    <DialogContext.Provider value={setCurrentDialog}>
      <Modal
        open={!!currentDialog}
        onClose={() =>
          currentDialog?.type !== "SWITCH_NETWORK" && setCurrentDialog(null)
        }
        transparent={(currentDialog as { transparent?: boolean })?.transparent}
        className={cn(
          "max-h-[95vh] overflow-y-auto",
          (currentDialog as { className?: string })?.className
        )}
      >
        {renderedDialog}
      </Modal>
      {children}
    </DialogContext.Provider>
  );
};

export const useOpenDialog = () => {
  const openDialog = useContext(DialogContext);
  if (!openDialog) {
    throw new Error("useOpenDialog must be used within a DialogProvider");
  }
  return openDialog;
};

export const useOpenDialogOptional = () => useContext(DialogContext);
