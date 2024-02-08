import { getCitizensForNamespace } from "../common/citizens/getCitizens";

export const getCitizens = ({
  page = 1,
  sort = "shuffle",
  seed = Math.random(),
}: {
  page: number;
  sort: string;
  seed?: number;
}) => getCitizensForNamespace({ page, sort, seed, namespace: "optimism" });
