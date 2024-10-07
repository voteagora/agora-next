import AgoraLoader, {
  LogoLoader,
} from "@/components/shared/AgoraLoader/AgoraLoader";
import Tenant from "@/lib/tenant/tenant";

export default function Loading() {
  const { ui } = Tenant.current();
  const shouldHideAgoraBranding = ui.hideAgoraBranding;

  if (shouldHideAgoraBranding) {
    return <LogoLoader />;
  }

  return <AgoraLoader />;
}
