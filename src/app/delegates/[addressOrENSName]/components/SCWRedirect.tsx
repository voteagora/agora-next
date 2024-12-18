import { fetchDelegateForSCW } from "@/app/api/common/delegates/getDelegateForSCW";
import { redirect } from "next/navigation";
import Tenant from "@/lib/tenant/tenant";

// Redirect from a smart contract wallet address to the owner delegate page
export const SCWRedirect = async ({ address }: { address: string }) => {
  const { ui } = Tenant.current();
  const scwConfig = ui.smartAccountConfig;

  if (!scwConfig) {
    return null;
  }

  const delegate = await fetchDelegateForSCW(address);
  if (delegate) {
    redirect(`/delegates/${delegate.address}`);
  }

  return null;
};
