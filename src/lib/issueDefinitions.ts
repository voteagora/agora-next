import { icons } from "@/assets/icons/icons";

type IssueTypeDefinition = {
  key: string;
  title: string;
  icon: keyof typeof icons;
};

export const issueDefinitions: IssueTypeDefinition[] = [
  {
    title: "Treasury management",
    key: "treasury",
    icon: "piggyBank",
  },
  {
    title: "Grant funding",
    key: "funding",
    icon: "measure",
  },
  {
    title: "Public goods",
    key: "publicGoods",
    icon: "ballot",
  },
];
