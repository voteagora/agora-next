import GovernorSettings from "@/app/info/components/GovernorSettings";
import { GovernorSettingsBlockConfig } from "@/lib/blocks/types";

interface GovernorSettingsBlockProps {
  config: GovernorSettingsBlockConfig;
}

/**
 * Governor Settings Block
 *
 * Displays governance parameters, contract addresses, and proposal types.
 * This is a zero-config block - all data comes from Tenant.current() and
 * blockchain queries via hooks.
 *
 * The component shows:
 * - Contract addresses (Governor, Token, Timelock)
 * - Governance parameters (Voting Delay, Voting Period, Timelock Delay)
 * - Proposal types with their thresholds and quorums
 */
export async function GovernorSettingsBlock({
  config,
}: GovernorSettingsBlockProps) {
  return <GovernorSettings />;
}
