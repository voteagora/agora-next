import DunaAdministration from "@/app/duna/components/DunaAdministration";
import TownsDunaAdministration from "@/app/duna/components/TownsDunaAdministration";
import { DUNAInfoBlockConfig } from "@/lib/blocks/types";
import Tenant from "@/lib/tenant/tenant";

interface DUNAInfoBlockProps {
  config: DUNAInfoBlockConfig;
}

/**
 * DUNA Info Block
 *
 * Displays DUNA Administration section with documents.
 * This is a zero-config block - all data comes from forum queries.
 *
 * The component shows:
 * - DUNA Administration header
 * - Documents section with upload/manage capabilities
 */
export async function DUNAInfoBlock({ config }: DUNAInfoBlockProps) {
  const { ui } = Tenant.current();

  return ui.toggle("towns-duna-administration")?.enabled ? (
    <TownsDunaAdministration />
  ) : (
    <DunaAdministration />
  );
}
