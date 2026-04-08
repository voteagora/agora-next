import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import { ClaimCard } from "@/components/vibdao/ClaimCard";
import { DevChainControls } from "@/components/vibdao/DevChainControls";
import { getClientContracts } from "@/lib/vibdao/contracts";
import { getSalaryClaims } from "@/lib/vibdao/data";
import { History } from "lucide-react";
import {
  formatDate,
  formatTokenAmount,
  shortenAddress,
} from "@/lib/vibdao/format";

export const dynamic = "force-dynamic";

export default async function ClaimPage() {
  const [contracts, claims] = await Promise.all([
    Promise.resolve(getClientContracts()),
    getSalaryClaims(20),
  ]);

  return (
    <main className="max-w-[76rem] mx-auto mt-10 px-4 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <PageHeader headerText="Claim" />
        <p className="text-secondary max-w-3xl">
          After a fellow proposal is executed, mine local blocks and claim the
          salary that has been released so far.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_24rem] gap-6">
        <div className="bg-neutral border border-line rounded-2xl shadow-newDefault p-6">
          <ClaimCard contracts={contracts} />
        </div>
        <div className="bg-neutral border border-line rounded-2xl shadow-newDefault p-6">
          <DevChainControls />
        </div>
      </div>

      <section className="bg-neutral border border-line rounded-2xl shadow-newDefault p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-wash">
                <History className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-primary">Recent Claims</h2>
            </div>
            <p className="text-sm leading-6 text-secondary">
              Salary withdrawals that have already been executed on the local
              chain.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-secondary border-b border-line">
                  <th className="py-2 pr-4">Member</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Block</th>
                  <th className="py-2">At</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="border-b border-line/60 transition-colors hover:bg-wash"
                  >
                    <td className="py-3 pr-4">{shortenAddress(claim.member)}</td>
                    <td className="py-3 pr-4">
                      {formatTokenAmount(claim.amount)} DOT
                    </td>
                    <td className="py-3 pr-4">{claim.blockNumber}</td>
                    <td className="py-3">{formatDate(claim.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
