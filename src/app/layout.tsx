import "@/styles/globals.scss";
import ClientLayout from "./Web3Provider";
import Header from "@/components/Header/Header";
import { fetchMetrics } from "@/app/api/common/metrics/getMetrics";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

async function fetchDaoMetrics() {
  "use server";
  return fetchMetrics();
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const metrics = await fetchDaoMetrics();

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <ClientLayout>
        <Header />
        {children}
        <DAOMetricsHeader metrics={metrics} />
      </ClientLayout>
    </html>
  );
}
