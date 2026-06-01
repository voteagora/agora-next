// export const dynamic = 'force-dynamic'; // this line is uncommented for e2e tests

import Head from "next/head";
import { Inter } from "next/font/google";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const inter = Inter({ subsets: ["latin"] });

export default function SpecUI() {
  return (
    <>
      <Head>
        <title>Agora API V2</title>
        <meta
          name="description"
          content="Open API Specification for Agora's public API v2"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${inter.className}`}>
        <SwaggerUI url="/api/v2/spec" />
      </main>
    </>
  );
}
