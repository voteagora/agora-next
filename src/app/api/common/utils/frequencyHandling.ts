export function frequencyToDateAndSQLcrit(
  frequency: string,
  timeCol: string
): {
  lookback: number;
  skipCrit: string;
} {
  const periodLowerCase = frequency.toLowerCase();

  let lookback: number;
  let skipCrit: string;

  switch (periodLowerCase) {
    case "24h":
      lookback = 90;
      skipCrit = "1=1";
      break;
    case "7d":
      lookback = 180;
      skipCrit = `extract(DOW from (${timeCol}) = extract(DOW from current_date)`;
      break;
    case "1m":
      lookback = 365;
      skipCrit = `extract(DAY from (${timeCol}) = 1`;
      break;
    case "3m":
      lookback = 365;
      skipCrit = `extract(DAY from ${timeCol}) = 1 AND mod(extract(MONTH from ${timeCol}), 3) = 0`;
      break;
    case "1y":
      lookback = 365 * 2;
      skipCrit = `extract(DAY from ${timeCol}) = 31 AND extract(MONTH from ${timeCol}) = 12`;
      break;
    default:
      throw new Error("Invalid frequency value");
  }

  return { lookback, skipCrit };
}
