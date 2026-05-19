"use client";

import React, {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

export type DialogRenderer = (
  params: any,
  closeDialog: () => void
) => ReactNode;

export type DialogDefinitionMap = Record<string, DialogRenderer>;

const DialogContext = createContext<(dialog: any | null) => void>(() => {});

type Props = {
  children: ReactNode;
};

const Modal: FC<
  {
    open: boolean;
    onClose: () => void;
    transparent: boolean | undefined;
    disableDismiss?: boolean;
    className?: string;
  } & Props
> = ({ open, children, onClose, transparent, disableDismiss, className }) => {
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
          onClick={() => !disableDismiss && onClose()}
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
            {!disableDismiss ? (
              <XMarkIcon
                className="h-5 w-5 text-secondary cursor-pointer absolute right-2 top-2"
                onClick={onClose}
              />
            ) : null}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const DialogProviderCore: FC<
  Props & {
    dialogDefinitions?: DialogDefinitionMap;
    loadDialogDefinitions?: () => Promise<DialogDefinitionMap>;
  }
> = ({ children, dialogDefinitions, loadDialogDefinitions }) => {
  const [currentDialog, setCurrentDialog] = useState<any | null>(null);
  const [loadedDialogDefinitions, setLoadedDialogDefinitions] = useState<
    DialogDefinitionMap | undefined
  >(dialogDefinitions);

  const closeCurrentDialog = () => {
    const onClose = (currentDialog as { params?: { onClose?: () => void } })
      ?.params?.onClose;
    if (typeof onClose === "function") {
      onClose();
    }
    setCurrentDialog(null);
  };

  useEffect(() => {
    if (currentDialog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [currentDialog]);

  useEffect(() => {
    if (!currentDialog || loadedDialogDefinitions || !loadDialogDefinitions) {
      return;
    }

    let cancelled = false;
    loadDialogDefinitions().then((definitions) => {
      if (!cancelled) {
        setLoadedDialogDefinitions(definitions);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentDialog, loadedDialogDefinitions, loadDialogDefinitions]);

  const renderDialog = currentDialog
    ? loadedDialogDefinitions?.[currentDialog.type]
    : null;
  const renderedDialog =
    currentDialog && renderDialog
      ? renderDialog(currentDialog.params as any, () => setCurrentDialog(null))
      : null;

  return (
    <DialogContext.Provider value={setCurrentDialog}>
      <Modal
        open={!!currentDialog}
        onClose={() =>
          currentDialog?.type !== "SWITCH_NETWORK" && closeCurrentDialog()
        }
        transparent={(currentDialog as { transparent?: boolean })?.transparent}
        disableDismiss={
          (currentDialog as { disableDismiss?: boolean })?.disableDismiss
        }
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
