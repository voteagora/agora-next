"use client";

import { DelegateActions } from "./DelegateActions";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
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
