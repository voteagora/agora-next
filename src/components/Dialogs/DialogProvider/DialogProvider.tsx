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

const DialogContext = createContext<(dialog: DialogType | null) => void>(
  () => {}
);

type Props = {
  children: ReactNode;
};

const Modal: FC<{ open: boolean; onClose: () => void } & Props> = ({
  open,
  children,
  onClose,
}) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={styles.dialog}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.98, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={styles.dialog_content}
          >
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
      <Modal open={!!currentDialog} onClose={() => setCurrentDialog(null)}>
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
