import Tenant from "@/lib/tenant/tenant";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const { ui } = Tenant.current();
export const GA_TRACKING_ID = ui?.googleAnalytics;

type GtagEvent = {
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
}: GtagEvent) => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
    ...custom_params,
  });
};
