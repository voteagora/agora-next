const SIM_SUPPORTED = new Set([
  1, 11155111, 10, 11155420, 42161, 421614, 8453, 534352,
]);

export function isChainSimulationSupported(chainId: number): boolean {
  return SIM_SUPPORTED.has(chainId);
}
