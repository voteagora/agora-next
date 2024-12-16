import Tenant from "@/lib/tenant/tenant";

const { ui } = Tenant.current();
export const GTM_ID = ui?.googleTagManager;

type DataLayerEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  custom_params?: { [key: string]: any };
};

export const event = ({
  action,
  category,
  label,
  value,
  custom_params,
}: DataLayerEvent) => {
  console.log("Pushing to dataLayer:", {
    action,
    category,
    label,
    value,
    custom_params,
  });

  if (!window.dataLayer) {
    console.error("dataLayer not found");
    return;
  }

  window.dataLayer.push({
    event: action,
    eventCategory: category,
    eventLabel: label,
    eventValue: value,
    ...custom_params,
  });
};
