module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(svg|png|jpg|jpeg)$": "<rootDir>/tests/mocks/fileMock.ts",
    "^@vercel/otel$": "<rootDir>/tests/mocks/otel.ts",
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(svg|png|jpg|jpeg)$": "jest-transform-stub",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
};
