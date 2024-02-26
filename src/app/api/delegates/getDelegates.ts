import {
  getDelegateForNamespace,
  getDelegatesForNamespace,
} from "../common/delegates/getDelegates";

export const getDelegates = ({
  page = 1,
  sort = "weighted_random",
  seed = Math.random(),
}: {
  page: number;
  sort: string;
  seed?: number;
}) => getDelegatesForNamespace({ page, sort, seed, namespace: "optimism" });

export const getDelegate = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) => getDelegateForNamespace({ addressOrENSName, namespace: "optimism" });
