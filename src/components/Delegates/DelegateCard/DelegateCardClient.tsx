"use client";

import { DelegateActions } from "./DelegateActions";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import { DelegateChunk } from "../DelegateCardList/DelegateCardList";

export default function DelegateCardClient({
  delegate,
}: {
  delegate: DelegateChunk;
}) {
  const { isAdvancedUser } = useIsAdvancedUser();

  return (
    <DelegateActions delegate={delegate} isAdvancedUser={isAdvancedUser} />
  );
}
