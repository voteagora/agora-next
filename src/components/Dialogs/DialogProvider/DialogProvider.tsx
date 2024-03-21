import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  FC,
} from "react";
import { dialogs, DialogType } from "./dialogs";
import styles from "./dialog.module.scss";
import { motion, AnimatePresence } from "framer-motion";

const DialogContext = createContext({
  setCurrentDialog: (dialog: DialogType | null) => {},
  setOverFlowDelegation: (value: boolean) => {},
});

type Props = {
  children: ReactNode;
};

const Modal: FC<
  {
    open: boolean;
    onClose: () => void;
    transparent: boolean | undefined;
    overFlowDelegation: boolean;
  } & Props
> = ({ open, children, onClose, transparent, overFlowDelegation }) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={transparent ? styles.dialog_transparent : styles.dialog}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.98, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={
              transparent
                ? styles.dialog_transparent_content
                : styles.dialog_content
            }
          >
            {children}
          </motion.div>
          {overFlowDelegation && (
            <p className="text-xs bg-gray-fa p-6 pb-3 pt-6 -mt-3 max-w-md rounded-bl-xl rounded-br-xl">
              You have delegated more than the total delegatable votes you have.
              Please reduce your current delegation before delegating more
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const DialogProvider: FC<Props> = ({ children }) => {
  const [currentDialog, setCurrentDialog] = useState<DialogType | null>(null);
  const [overFlowDelegation, setOverFlowDelegation] = useState(false);

  const renderedDialog =
    currentDialog &&
    dialogs[currentDialog.type](currentDialog.params as any, () =>
      setCurrentDialog(null)
    );

  return (
    <DialogContext.Provider value={{ setCurrentDialog, setOverFlowDelegation }}>
      <Modal
        open={!!currentDialog}
        onClose={() =>
          currentDialog?.type !== "SWITCH_NETWORK" && setCurrentDialog(null)
        }
        transparent={(currentDialog as { transparent?: boolean })?.transparent}
        overFlowDelegation={overFlowDelegation}
      >
        {renderedDialog}
      </Modal>
      {children}
    </DialogContext.Provider>
  );
};

export const useOpenDialog = () => {
  const { setCurrentDialog: openDialog } = useContext(DialogContext);
  if (!openDialog) {
    throw new Error("useOpenDialog must be used within a DialogProvider");
  }
  return openDialog;
};

export const useSetOverFlowDelegation = () => {
  const { setOverFlowDelegation } = useContext(DialogContext);

  if (!setOverFlowDelegation) {
    throw new Error(
      "useSetOverFlowDelegation must be used within a DialogProvider"
    );
  }

  return setOverFlowDelegation;
};

export const useOpenDialogOptional = () => useContext(DialogContext);
