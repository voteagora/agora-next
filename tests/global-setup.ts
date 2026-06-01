import { FullConfig } from "@playwright/test";
import * as http from "http";
import {
  startMockArchiveServer,
  MOCK_ARCHIVE_SERVER_PORT,
} from "./helpers/archiveMockServer";

function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = http
      .get(`http://localhost:${port}/`, () => resolve(true))
      .on("error", () => resolve(false));
    probe.setTimeout(500, () => {
      probe.destroy();
      resolve(false);
    });
  });
}

export default async function globalSetup(_config: FullConfig) {
  const alreadyRunning = await isPortInUse(MOCK_ARCHIVE_SERVER_PORT);

  if (alreadyRunning) {
    console.log(
      `[archive-mock] Reusing existing mock server on http://localhost:${MOCK_ARCHIVE_SERVER_PORT}`
    );
    return;
  }

  const server = startMockArchiveServer();

  console.log(
    `[archive-mock] Mock CPLS server running on http://localhost:${MOCK_ARCHIVE_SERVER_PORT}`
  );

  return async () => {
    server.close();
    console.log("[archive-mock] Mock CPLS server stopped");
  };
}
