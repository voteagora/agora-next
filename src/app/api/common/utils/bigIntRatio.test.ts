import { expect } from "@jest/globals";

import { calculateBigIntRatio } from "./bigIntRatio";

describe("calculateBigIntRatio", () => {
  test("handles zero denominator", () => {
    expect(calculateBigIntRatio(10n, 0n)).toBe("0");
  });

  test("calculates simple ratios correctly", () => {
    expect(calculateBigIntRatio(5n, 10n)).toBe("0.5");
  });

  test("handles large numbers accurately", () => {
    const trillion = 1000000000000n;
    const billion = 1000000000n;

    expect(calculateBigIntRatio(billion, trillion)).toBe("0.001");
  });

  test("maintains precision with very different magnitudes", () => {
    const veryLarge = 1000000000000n;
    const verySmall = 49n;

    const result = calculateBigIntRatio(verySmall, veryLarge);
    expect(result).toBe("0.000000000049");
  });

  test("handles 18-digit BigInt numbers", () => {
    const num1 = 10n;
    const num2 = 123456789012345678n;

    const result1 = calculateBigIntRatio(num1, num2);
    expect(result1).toBe("0.000000000000000081");
  });
});
