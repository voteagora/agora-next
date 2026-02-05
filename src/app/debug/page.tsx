import React from "react";
import Tenant from "@/lib/tenant/tenant";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBlockScanAddress } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import linkIcon from "@/assets/icons/link.svg";

export const dynamic = "force-dynamic";

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="mb-10">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-primary mb-2">{title}</h2>
        {description && (
          <p className="text-secondary text-sm opacity-75">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => {
  return (
    <div className="flex items-start py-3 border-b border-line last:border-0">
      <div className="w-1/3 font-semibold text-secondary pr-6">{label}</div>
      <div className="w-2/3 text-primary break-words">{value}</div>
    </div>
  );
};

const ContractRow = ({
  name,
  address,
  chainName,
}: {
  name: string;
  address?: string;
  chainName?: string;
}) => {
  if (!address) return null;

  return (
    <div className="flex items-start py-3 border-b border-line last:border-0">
      <div className="w-1/3 font-semibold text-secondary pr-6">{name}</div>
      <div className="w-2/3">
        <div className="text-primary break-words font-mono text-sm mb-1">
          {address}
        </div>
        {chainName && (
          <div className="text-secondary text-xs mb-2">{chainName}</div>
        )}
        <Link
          href={getBlockScanAddress(address)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
        >
          <Image alt="" width={14} height={14} src={linkIcon} />
          View on explorer
        </Link>
      </div>
    </div>
  );
};

const safeStringify = (obj: any, maxLength = 200): string => {
  try {
    const seen = new WeakSet();
    const replacer = (key: string, value: any) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      if (typeof value === "function") {
        return "[Function]";
      }
      if (typeof value === "symbol") {
        return "[Symbol]";
      }
      if (React.isValidElement(value)) {
        return "[React Component]";
      }
      return value;
    };
    const str = JSON.stringify(obj, replacer, 2);
    return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
  } catch (error) {
    return `[Error: ${error instanceof Error ? error.message : "Unknown error"}]`;
  }
};

export default function TenantDebugPage() {
  const tenant = Tenant.current();
  const { contracts, ui, namespace, slug, brandName, isProd } = tenant;

  const toggles = (ui as any)._toggles as
    | Array<{ name: string; enabled: boolean; config?: any }>
    | undefined;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              {brandName} Configuration
            </h1>
            <p className="text-secondary text-sm opacity-75">
              Complete configuration details for the current tenant instance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                isProd
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {isProd ? "Production" : "Development"}
            </span>
          </div>
        </div>
      </div>

      <Section
        title="Smart Contracts"
        description="On-chain contract addresses and network information"
      >
        <div className="bg-white rounded-lg border border-line overflow-hidden">
          <div className="p-6 space-y-0">
            <ContractRow
              name="Governor"
              address={contracts.governor.address}
              chainName={contracts.governor.chain.name}
            />
            <ContractRow
              name="Token"
              address={contracts.token.address}
              chainName={contracts.token.chain.name}
            />
            {contracts.timelock && (
              <ContractRow
                name="Timelock"
                address={contracts.timelock.address}
                chainName={contracts.timelock.chain.name}
              />
            )}
            {contracts.proposalTypesConfigurator && (
              <ContractRow
                name="Proposal Types Configurator"
                address={contracts.proposalTypesConfigurator.address}
                chainName={contracts.proposalTypesConfigurator.chain.name}
              />
            )}
            {contracts.votableSupplyOracle && (
              <ContractRow
                name="Votable Supply Oracle"
                address={contracts.votableSupplyOracle.address}
                chainName={contracts.votableSupplyOracle.chain.name}
              />
            )}
            {contracts.staker && (
              <ContractRow
                name="Staker"
                address={contracts.staker.address}
                chainName={contracts.staker.chain.name}
              />
            )}
            {contracts.alligator && (
              <ContractRow
                name="Alligator"
                address={contracts.alligator.address}
                chainName={contracts.alligator.chain.name}
              />
            )}
          </div>
        </div>
      </Section>

      <Section
        title="Contract Configuration"
        description="Governance model and contract type settings"
      >
        <div className="bg-white rounded-lg border border-line overflow-hidden">
          <div className="p-6 space-y-0">
            <InfoRow
              label="Delegation Model"
              value={
                <span className="font-mono text-sm">
                  {contracts.delegationModel || (
                    <span className="text-secondary italic">
                      Not configured
                    </span>
                  )}
                </span>
              }
            />
            <InfoRow
              label="Governor Type"
              value={
                <span className="font-mono text-sm">
                  {contracts.governorType || (
                    <span className="text-secondary italic">
                      Not configured
                    </span>
                  )}
                </span>
              }
            />
            <InfoRow
              label="Timelock Type"
              value={
                <span className="font-mono text-sm">
                  {contracts.timelockType || (
                    <span className="text-secondary italic">
                      Not configured
                    </span>
                  )}
                </span>
              }
            />
            <InfoRow
              label="Support Scopes"
              value={
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    contracts.supportScopes
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {contracts.supportScopes ? "Yes" : "No"}
                </span>
              }
            />
            {contracts.easRecipient && (
              <InfoRow
                label="OODAO EAS Recipient"
                value={
                  <span className="font-mono text-sm">
                    {contracts.easRecipient}
                  </span>
                }
              />
            )}
            {contracts.chainForTime && (
              <InfoRow
                label="Chain for Time"
                value={
                  <span className="font-semibold">
                    {contracts.chainForTime.name}
                  </span>
                }
              />
            )}
          </div>
        </div>
      </Section>

      {toggles && toggles.length > 0 && (
        <Section
          title="Feature Toggles"
          description="Enabled and disabled features for this tenant"
        >
          <div className="bg-white rounded-lg border border-line overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-secondary bg-wash">
                    Toggle Name
                  </TableHead>
                  <TableHead className="font-semibold text-secondary bg-wash w-32">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-secondary bg-wash w-24">
                    Config
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {toggles.map((toggle, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm py-3">
                      <div className="font-medium text-primary">
                        {toggle.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          toggle.enabled
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {toggle.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {toggle.config ? (
                        <details className="cursor-pointer group">
                          <summary className="text-xs text-blue-600 hover:text-blue-800 group-open:text-blue-800">
                            View config
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono overflow-x-auto border border-gray-200 max-h-64 overflow-y-auto">
                            {safeStringify(toggle.config, 1000)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-xs text-secondary italic">
                          None
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>
      )}
    </div>
  );
}
