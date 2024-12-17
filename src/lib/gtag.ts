import Tenant from "@/lib/tenant/tenant";

const { ui } = Tenant.current();
export const GTM_ID = ui?.googleTagManager;

type DataLayerEvent = {
  action: string;
  custom_params?: { [key: string]: any };
};

export const event = ({ action, custom_params }: DataLayerEvent) => {
  console.log("Pushing to dataLayer:", {
    action,
    custom_params,
  });

  if (!window.dataLayer) {
    console.error("dataLayer not found");
    return;
  }

  window.dataLayer.push({
    event: action,
    ...custom_params,
  });
};
