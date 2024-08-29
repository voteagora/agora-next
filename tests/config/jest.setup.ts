jest.mock("react", () => ({
  ...jest.requireActual("react"),
  cache: jest.fn((fn) => fn),
}));

import { config } from "dotenv";
config({ path: ".env.test" });
