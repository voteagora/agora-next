import { useState, useCallback } from "react";
import { useForum } from "./useForum";
import useRequireLogin from "./useRequireLogin";

export type VPAction = "topic" | "post" | "upvote" | "react";

interface UseVPCheckReturn {
  /**
   * Check VP and execute callback if user has sufficient permissions
   * @param callback - Function to execute if VP check passes
   * @param skipVPCheck - Optional flag to skip VP check (useful for remove actions)
   * @returns True if action was executed, false if blocked
   */
  checkAndProceed: (
    callback: () => Promise<void> | void,
    skipVPCheck?: boolean
  ) => Promise<boolean>;
  
  /** Whether the VP modal is currently shown */
  showVPModal: boolean;
  
  /** Function to manually control modal visibility */
  setShowVPModal: (show: boolean) => void;
  
  /** Forum permissions object */
  permissions: ReturnType<typeof useForum>["permissions"];
}

/**
 * Hook to handle VP checks with modal for forum actions
 * Consolidates the common pattern of checking login, checking VP, and showing modal
 * 
 * @param action - The type of action to check VP for
 * @returns Object with checkAndProceed function, modal state, and permissions
 * 
 * @example
 * ```tsx
 * const { checkAndProceed, showVPModal, setShowVPModal, permissions } = useVPCheck("upvote");
 * 
 * const handleUpvote = () => checkAndProceed(async () => {
 *   await upvoteTopic(topicId);
 * });
 * 
 * return (
 *   <>
 *     <button onClick={handleUpvote}>Upvote</button>
 *     <InsufficientVPModal
 *       isOpen={showVPModal}
 *       onClose={() => setShowVPModal(false)}
 *       action="upvote"
 *     />
 *   </>
 * );
 * ```
 */
export function useVPCheck(action: VPAction): UseVPCheckReturn {
  const { checkVPBeforeAction, permissions } = useForum();
  const requireLogin = useRequireLogin();
  const [showVPModal, setShowVPModal] = useState(false);

  const checkAndProceed = useCallback(
    async (
      callback: () => Promise<void> | void,
      skipVPCheck: boolean = false
    ): Promise<boolean> => {
      // Step 1: Check login
      const loggedIn = await requireLogin();
      if (!loggedIn) {
        return false;
      }

      // Step 2: Check VP (unless skipped)
      if (!skipVPCheck) {
        const vpCheck = checkVPBeforeAction(action);
        if (!vpCheck.canProceed) {
          setShowVPModal(true);
          return false;
        }
      }

      // Step 3: Execute callback
      await callback();
      return true;
    },
    [requireLogin, checkVPBeforeAction, action]
  );

  return {
    checkAndProceed,
    showVPModal,
    setShowVPModal,
    permissions,
  };
}
