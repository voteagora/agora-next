// Mock for next/font/google exports
export const Inter = () => ({
  style: { fontFamily: "Inter" },
  className: "mock-inter",
  variable: "--mock-inter",
});

export const Rajdhani = () => ({
  style: { fontFamily: "Rajdhani" },
  className: "mock-rajdhani",
  variable: "--mock-rajdhani",
});

export const Chivo_Mono = () => ({
  style: { fontFamily: "ChivoMono" },
  className: "mock-chivo-mono",
  variable: "--mock-chivo-mono",
});

// Mock for next/font/local (default export)
export default () => ({
  style: { fontFamily: "MockFont" },
  className: "mock-font",
  variable: "--mock-font",
});
