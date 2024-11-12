import { Decimal } from "@prisma/client/runtime";

export function autobalanceAllocations<
  T extends { allocation: Decimal; locked: boolean; id: string },
>({ allocations, idToSkip }: { allocations: T[]; idToSkip: string }) {
  const [amountToBalance, totalUnlocked, unlockedEntities] = allocations.reduce(
    (acc, allocation) => {
      acc[0] -=
        allocation.locked || allocation.id === idToSkip
          ? Number(allocation.allocation.toFixed(2))
          : 0;
      return [
        acc[0] < 0 ? 0 : acc[0],
        acc[1] +
          (allocation.locked || allocation.id === idToSkip
            ? 0
            : Number(allocation.allocation.toFixed(2))),
        acc[2] + (allocation.locked || allocation.id === idToSkip ? 0 : 1),
      ];
    },
    [100, 0, 0]
  );

  return allocations.map((allocation) => {
    if (!allocation.locked && allocation.id !== idToSkip) {
      return {
        ...allocation,
        allocation: totalUnlocked
          ? (Number(allocation.allocation.toFixed(2)) / totalUnlocked) *
            amountToBalance
          : unlockedEntities
            ? amountToBalance / unlockedEntities
            : 0,
      };
    }
    return allocation;
  });
}
