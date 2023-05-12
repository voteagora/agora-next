import Header from "@/components/Header";
import "./globals.scss";
import { Inter } from "next/font/google";
import DevBanner from "@/components/DevBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Agora Next",
  description: "The future of DAO governance",
};

const isDev = process.env.AGORA_ENV === "dev";

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
      <body className={inter.className}>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        {isDev && <DevBanner />}
        <Header />
        {children}
      </body>
    </html>
  );
}
