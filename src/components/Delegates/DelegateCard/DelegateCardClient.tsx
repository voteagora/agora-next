"use client";

import { DelegateActions } from "./DelegateActions";
import useIsAdvancedUser from "@/hooks/useIsAdvancedUser";
import { DelegateChunk } from "@/lib/types/delegate";
import useConnectedDelegate from "@/hooks/useConnectedDelegate";

export default function DelegateCardClient({
  delegate,
}: {
  delegate: DelegateChunk;
}) {
  const { isAdvancedUser } = useIsAdvancedUser();
  const { advancedDelegators } = useConnectedDelegate();

  return (
    <DelegateActions
      delegate={delegate}
      isAdvancedUser={isAdvancedUser}
      delegators={advancedDelegators}
    />
  );
}
