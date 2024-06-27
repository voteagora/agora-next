export function frequencyToLookbackDayCount(frequency: string): {
  lookback: number;
} {
  const periodLowerCase = frequency.toLowerCase();

  let lookback: number;

  switch (periodLowerCase) {
    case "3d":
      lookback = 3;
      break;
    case "7d":
      lookback = 7;
      break;
    case "1m":
    case "30d":
      lookback = 30;
      break;
    case "3m":
    case "90d":
      lookback = 90;
      break;
    case "1y":
      lookback = 365;
      break;
    case "max":
      lookback = 365 * 10;
      break;
    default:
      throw new Error("Invalid frequency value");
  }

  return { lookback };
}
