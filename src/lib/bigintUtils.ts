export const bigIntMax = (...args: bigint[]) =>
  args.reduce((m, e) => (e > m ? e : m));

export const bigIntMin = (...args: bigint[]) =>
  args.reduce((m, e) => (e < m ? e : m));
