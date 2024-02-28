export type Deployments = "optimism";

export const DEPLOYMENT_NAME = process.env
  .NEXT_PUBLIC_AGORA_INSTANCE_NAME as Deployments;
