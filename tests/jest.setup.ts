jest.mock("@vercel/otel", () => ({
  registerOTel: jest.fn(),
}));

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  cache: (fn: Function) => fn,
}));
