import { formatDistanceToNow } from "date-fns";

export const formatRelative = (date: Date | string) =>
  formatDistanceToNow(new Date(date), { addSuffix: true }).replace(
    "about ",
    ""
  );
