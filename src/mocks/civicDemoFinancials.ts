import { isCivicDemoEnabled } from "@/mocks/civicDemoProposals";

// FY2024 and FY2023 figures from CIVIC Form 990 via ProPublica Nonprofit Explorer
// https://projects.propublica.org/nonprofits/organizations/753130860

export function getCivicDemoFinancialMetrics() {
  return {
    metrics: [
      {
        id: 1,
        dao_slug: "OP",
        topic_id: null,
        year: 2024,
        month: "December",
        data: {
          TOTAL_ASSETS: 9359445,
          NET_PROFIT: 1316269,
          TOTAL_OPERATING_EXPENSES: 9983270,
          // Approximate cash & equivalents (~22% of total assets per FY2024 balance sheet mix)
          CASH_AND_CASH_EQUIVALENTS: 2104000,
        },
        createdAt: new Date("2025-09-29"),
        updatedAt: new Date("2025-09-29"),
      },
      {
        id: 2,
        dao_slug: "OP",
        topic_id: null,
        year: 2023,
        month: "December",
        data: {
          TOTAL_ASSETS: 6764699,
          NET_LOSS: 2661187,
          TOTAL_OPERATING_EXPENSES: 13333686,
          CASH_AND_CASH_EQUIVALENTS: 1420000,
        },
        createdAt: new Date("2024-09-30"),
        updatedAt: new Date("2024-09-30"),
      },
    ],
  };
}

export type CivicFinancialStatement = {
  id: number;
  name: string;
  url: string;
  ipfsCid: string;
  createdAt: string;
  uploadedBy: string;
  archived?: boolean;
  revealTime?: string | null;
  expirationTime?: string | null;
  topicId?: number;
  topicTitle?: string;
};

export function getCivicDemoFinancialStatements(): CivicFinancialStatement[] {
  return [
    {
      id: 1,
      name: "2025 Annual Report",
      url: "https://civiliansinconflict.org/wp-content/uploads/2026/06/FINAL-CIVIC-Annual-Report-2025.pdf",
      ipfsCid: "",
      createdAt: "2026-06-04T00:00:00.000Z",
      uploadedBy: "0x0000000000000000000000000000000000000000",
    },
    {
      id: 2,
      name: "2024 Annual Report",
      url: "https://civiliansinconflict.org/annual-reports/",
      ipfsCid: "",
      createdAt: "2025-03-15T00:00:00.000Z",
      uploadedBy: "0x0000000000000000000000000000000000000000",
    },
    {
      id: 3,
      name: "FY2024 IRS Form 990",
      url: "https://projects.propublica.org/nonprofits/organizations/753130860",
      ipfsCid: "",
      createdAt: "2025-09-29T00:00:00.000Z",
      uploadedBy: "0x0000000000000000000000000000000000000000",
    },
    {
      id: 4,
      name: "2023 Annual Report",
      url: "https://civiliansinconflict.org/annual-reports/",
      ipfsCid: "",
      createdAt: "2024-03-15T00:00:00.000Z",
      uploadedBy: "0x0000000000000000000000000000000000000000",
    },
    {
      id: 5,
      name: "2022 Annual Report",
      url: "https://civiliansinconflict.org/annual-reports/",
      ipfsCid: "",
      createdAt: "2023-03-15T00:00:00.000Z",
      uploadedBy: "0x0000000000000000000000000000000000000000",
    },
  ];
}

export { isCivicDemoEnabled };
