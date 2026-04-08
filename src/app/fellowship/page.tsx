import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import {
  getFellows,
  getSalaryClaims,
  getTreasuryTransfers,
} from "@/lib/vibdao/data";
import {
  BadgeDollarSign,
  Coins,
  Landmark,
  Users,
  WalletCards,
} from "lucide-react";
import {
  formatDate,
  formatTokenAmount,
  shortenAddress,
} from "@/lib/vibdao/format";

export const dynamic = "force-dynamic";

export default async function FellowshipPage() {
  const [fellows, claims, transfers] = await Promise.all([
    getFellows(),
    getSalaryClaims(20),
    getTreasuryTransfers(20),
  ]);

  const activeFellows = fellows.filter((fellow) => fellow.active).length;
  const totalClaimable = fellows.reduce(
    (sum, fellow) => sum + BigInt(fellow.claimableAmount),
    0n
  );
  const totalMonthlySalary = fellows.reduce(
    (sum, fellow) => sum + BigInt(fellow.monthlySalary),
    0n
  );

  return (
    <main className="max-w-[76rem] mx-auto mt-10 px-4 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <PageHeader headerText="Fellowship" />
        <p className="text-secondary max-w-3xl">
          Track fellow membership, monthly salary rates, claim history, and the
          treasury transfers executed through governance.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-line bg-neutral shadow-newDefault p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-wash">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
            Active Fellows
          </span>
          <div className="mt-3 text-3xl font-semibold text-primary">
            {activeFellows}
          </div>
          <p className="mt-2 text-sm leading-6 text-secondary">
            Members currently eligible for salary release and governance duties.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-neutral shadow-newDefault p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-wash">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
            Monthly Payroll
          </span>
          <div className="mt-3 text-3xl font-semibold text-primary">
            {formatTokenAmount(totalMonthlySalary)} DOT
          </div>
          <p className="mt-2 text-sm leading-6 text-secondary">
            Current combined salary commitment across all fellow seats.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-neutral shadow-newDefault p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-wash">
            <WalletCards className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
            Claimable Now
          </span>
          <div className="mt-3 text-3xl font-semibold text-primary">
            {formatTokenAmount(totalClaimable)} DOT
          </div>
          <p className="mt-2 text-sm leading-6 text-secondary">
            Salary currently released onchain and ready to be claimed.
          </p>
        </div>
      </section>

      <section className="bg-neutral border border-line rounded-xl shadow-newDefault p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-wash">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-primary">Fellows</h2>
            </div>
            <p className="text-sm leading-6 text-secondary">
              A live view of who is in the fellowship, what each member earns,
              and how much has already unlocked.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-secondary border-b border-line">
                  <th className="py-2 pr-4">Member</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Monthly Salary</th>
                  <th className="py-2 pr-4">Claimable</th>
                  <th className="py-2">Rate / Block</th>
                </tr>
              </thead>
              <tbody>
                {fellows.map((fellow) => (
                  <tr
                    key={fellow.id}
                    className="border-b border-line/60 transition-colors hover:bg-wash"
                  >
                    <td className="py-3 pr-4">{shortenAddress(fellow.member)}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          fellow.active
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {fellow.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {formatTokenAmount(fellow.monthlySalary)} DOT
                    </td>
                    <td className="py-3 pr-4">
                      {formatTokenAmount(fellow.claimableAmount)} DOT
                    </td>
                    <td className="py-3">
                      {formatTokenAmount(fellow.ratePerBlockWad)} DOT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-neutral border border-line rounded-xl shadow-newDefault p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-wash">
                  <BadgeDollarSign className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-primary">
                  Salary Claim History
                </h2>
              </div>
              <p className="text-sm leading-6 text-secondary">
                Recent salary withdrawals executed by fellows after release.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between rounded-xl border border-line bg-wash/60 p-4"
                >
                  <div>
                    <strong className="text-primary">
                      {formatTokenAmount(claim.amount)} DOT
                    </strong>
                    <p className="text-secondary text-sm">
                      {shortenAddress(claim.member)}
                    </p>
                  </div>
                  <span className="text-sm text-secondary">
                    {formatDate(claim.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-neutral border border-line rounded-xl shadow-newDefault p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-wash">
                  <Landmark className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-primary">
                  Treasury Transfers
                </h2>
              </div>
              <p className="text-sm leading-6 text-secondary">
                Governance-triggered payouts and outbound treasury movements.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {transfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between rounded-xl border border-line bg-wash/60 p-4"
                >
                  <div>
                    <strong className="text-primary">
                      {formatTokenAmount(transfer.amount)} DOT
                    </strong>
                    <p className="text-secondary text-sm">
                      {transfer.transferType} to{" "}
                      {shortenAddress(transfer.recipient)}
                    </p>
                  </div>
                  <span className="text-sm text-secondary">
                    Block {transfer.blockNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
