import { DaoSlug } from "@prisma/client";

export type Deployments = "optimism";

export const DEPLOYMENT_NAME = process.env
  .NEXT_PUBLIC_AGORA_INSTANCE_NAME as Deployments;

export const deploymentToDaoSlug = (deployment: Deployments): DaoSlug => {
  switch (deployment) {
    case "optimism":
      return "OP";
  }
};
