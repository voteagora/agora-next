import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import { DonateForm } from "@/components/vibdao/DonateForm";
import { getClientContracts } from "@/lib/vibdao/contracts";
import { getDonationSettings, getDonations } from "@/lib/vibdao/data";
import { Coins, History } from "lucide-react";
import {
  formatDate,
  formatTokenAmount,
  shortenAddress,
} from "@/lib/vibdao/format";

export const dynamic = "force-dynamic";

export default async function DonatePage() {
  const [contracts, donations, donationSettings] = await Promise.all([
    Promise.resolve(getClientContracts()),
    getDonations(20),
    getDonationSettings(),
  ]);

  return (
    <main className="max-w-[76rem] mx-auto mt-10 px-4 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <PageHeader headerText="Donate" />
        <p className="text-secondary max-w-3xl">
          Donations move DOT into the treasury and mint the same amount of
          non-transferable VIB voting power to the beneficiary.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="bg-neutral border border-line rounded-2xl shadow-newDefault p-6">
          <DonateForm contracts={contracts} minimumDonation={donationSettings.minimumDonation} />
        </div>
        <div className="bg-neutral border border-line rounded-2xl shadow-newDefault p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-wash">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-primary">Donation Policy</h2>
            </div>
            <p className="text-sm leading-6 text-secondary">
              Governance can update the minimum donation threshold through an onchain proposal.
            </p>
            <div className="rounded-xl border border-line bg-wash px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-secondary">
                Current Minimum
              </p>
              <p className="mt-2 text-2xl font-semibold text-primary">
                {formatTokenAmount(donationSettings.minimumDonation)} DOT
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral border border-line rounded-2xl shadow-newDefault p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-wash">
                <History className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-primary">
                Recent Donation History
              </h2>
            </div>
            <p className="text-sm leading-6 text-secondary">
              Treasury funding and voting-power minting events from the local
              chain.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-secondary border-b border-line">
                  <th className="py-2 pr-4">Donor</th>
                  <th className="py-2 pr-4">Beneficiary</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">VIB</th>
                  <th className="py-2 pr-4">Block</th>
                  <th className="py-2">At</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr
                    key={donation.id}
                    className="border-b border-line/60 transition-colors hover:bg-wash"
                  >
                    <td className="py-3 pr-4">{shortenAddress(donation.donor)}</td>
                    <td className="py-3 pr-4">
                      {shortenAddress(donation.beneficiary)}
                    </td>
                    <td className="py-3 pr-4">
                      {formatTokenAmount(donation.amount)} DOT
                    </td>
                    <td className="py-3 pr-4">
                      {formatTokenAmount(donation.votingPower)} VIB
                    </td>
                    <td className="py-3 pr-4">{donation.blockNumber}</td>
                    <td className="py-3">{formatDate(donation.createdAt)}</td>
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
