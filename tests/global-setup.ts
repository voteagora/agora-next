import { FullConfig } from "@playwright/test";
import {
  startMockArchiveServer,
  MOCK_ARCHIVE_SERVER_PORT,
} from "./helpers/archiveMockServer";

export default async function globalSetup(_config: FullConfig) {
  const server = startMockArchiveServer();

  console.log(
    `[archive-mock] Mock CPLS server running on http://localhost:${MOCK_ARCHIVE_SERVER_PORT}`
  );

  return async () => {
    server.close();
    console.log("[archive-mock] Mock CPLS server stopped");
  };
}
