export function calculateBigIntRatio(
  numerator: bigint,
  denominator: bigint
): string {
  if (!denominator || denominator <= 0n) return "0";

  const magnitude = Math.abs(
    denominator.toString().length - numerator.toString().length + 3
  );
  const scalingFactor = 10n ** BigInt(magnitude);

  const result =
    Number(numerator * scalingFactor) / Number(denominator * scalingFactor);

  const safeMaxDigits = Math.min(magnitude, 20);

  return result.toLocaleString("fullwide", {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: safeMaxDigits,
  });
}
