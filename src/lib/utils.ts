import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const secondsPerBlock = 12;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(address: string) {
  return (
    address &&
    [address.substring(0, 4), address.substring(address.length - 4)].join("...")
  );
}
