import "./globals.scss";
import ClientLayout from './Web3Provider'
import Footer from './components/Footer'


declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function (): string {
  return this.toString();
};


export const metadata = {
  title: "Agora Next",
  description: "The future of DAO governance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <ClientLayout>{children}</ClientLayout>
      <Footer />
    </html>
  );
}
