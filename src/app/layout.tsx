import "@/styles/globals.scss";
import ClientLayout from "./Web3Provider";
import Header from "@/components/Header/Header";

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

export const metadata = {
  metadataBase: new URL("https://vote.optimism.io"),
  alternates: {
    canonical: "/",
  },
  title: "Agora - Home of Optimism Voters",
  description: "Agora is the home of Optimism voters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <ClientLayout>
        <Header />
        {children}
      </ClientLayout>
    </html>
  );
}
