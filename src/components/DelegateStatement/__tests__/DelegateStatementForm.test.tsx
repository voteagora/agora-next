import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import DelegateStatementForm from "../DelegateStatementForm";
import type { DelegateStatementFormValues } from "../CurrentDelegateStatement";

const pushMock = vi.fn();
const submitDelegateStatementMock = vi.fn();
const signMessageAsyncMock = vi.fn();
const setSaveSuccessMock = vi.fn();
const ensureSiweSessionMock = vi.fn();

const defaultValues: DelegateStatementFormValues = {
  agreeCodeConduct: true,
  agreeDaoPrinciples: true,
  daoSlug: "UNI",
  discord: "",
  delegateStatement: "Delegate statement body",
  email: "",
  twitter: "",
  warpcast: "",
  scwAddress: "",
  topIssues: [
    {
      type: "governance",
      value: "Fix governance",
    },
  ],
  topStakeholders: [],
  openToSponsoringProposals: null,
  mostValuableProposals: [],
  leastValuableProposals: [],
  notificationPreferences: {
    wants_proposal_created_email: "prompt",
    wants_proposal_ending_soon_email: "prompt",
  },
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("wagmi", () => ({
  useAccount: vi.fn(() => ({
    address: "0x1234567890123456789012345678901234567890",
    chain: { id: 1 },
  })),
}));

vi.mock("@/app/delegates/actions", () => ({
  submitDelegateStatement: (...args: unknown[]) =>
    submitDelegateStatementMock(...args),
}));

vi.mock("@/hooks/useEnsureSiweSession", () => ({
  useEnsureSiweSession: () => ({
    clearSiweSession: vi.fn(),
    ensureSiweSession: ensureSiweSessionMock,
    isSigningIn: false,
    loadSiweJwt: vi.fn(),
    walletType: "eoa",
  }),
}));

vi.mock("@/hooks/useSmartAccountAddress", () => ({
  useSmartAccountAddress: () => ({
    data: undefined,
  }),
}));

vi.mock("@/hooks/useDelegate", () => ({
  useDelegate: () => ({
    data: null,
  }),
}));

vi.mock("@/stores/delegateStatement", () => ({
  useDelegateStatementStore: () => setSaveSuccessMock,
}));

vi.mock("@/components/ui/form", () => ({
  Form: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/Button", () => ({
  UpdatedButton: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../DelegateStatementFormSection", () => ({
  __esModule: true,
  default: () => <div>DelegateStatementFormSection</div>,
}));

vi.mock("../TopIssuesFormSection", () => ({
  __esModule: true,
  default: () => <div>TopIssuesFormSection</div>,
}));

vi.mock("../OtherInfoFormSection", () => ({
  __esModule: true,
  default: () => <div>OtherInfoFormSection</div>,
}));

vi.mock("../TopStakeholdersFormSection", () => ({
  __esModule: true,
  default: () => <div>TopStakeholdersFormSection</div>,
}));

vi.mock("@/components/Delegates/DelegateCard/DelegateCard", () => ({
  __esModule: true,
  default: () => <div>DelegateCard</div>,
}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      ui: {
        governanceIssues: [],
        governanceStakeholders: [],
      },
      contracts: {},
    }),
  },
}));

vi.mock("react-hook-form", async () => {
  const actual =
    await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

  return {
    ...actual,
    useWatch: vi.fn(() => true),
  };
});

function createForm(values: DelegateStatementFormValues) {
  return {
    control: {},
    formState: {
      isSubmitting: false,
      isValid: true,
      isSubmitted: false,
    },
    handleSubmit:
      (handler: (nextValues: DelegateStatementFormValues) => Promise<void>) =>
      async (event?: { preventDefault?: () => void }) => {
        event?.preventDefault?.();
        await handler(values);
      },
  } as never;
}

describe("DelegateStatementForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ensureSiweSessionMock.mockResolvedValue("jwt-token");
    signMessageAsyncMock.mockResolvedValue("0xabc123");
    submitDelegateStatementMock.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
  });

  it("submits with a SIWE JWT for EOAs", async () => {
    render(<DelegateStatementForm form={createForm(defaultValues)} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Submit delegate profile" })
    );

    await waitFor(() =>
      expect(submitDelegateStatementMock).toHaveBeenCalledWith(
        expect.objectContaining({
          address: "0x1234567890123456789012345678901234567890",
          auth: {
            kind: "siwe_jwt",
            jwt: "jwt-token",
          },
        })
      )
    );

    expect(ensureSiweSessionMock).toHaveBeenCalledTimes(1);
    expect(signMessageAsyncMock).not.toHaveBeenCalled();
  });

  it("continues submission after Safe SIWE auth succeeds", async () => {
    ensureSiweSessionMock.mockImplementation(
      async (options?: {
        onSafeAuthenticated?: (jwt: string) => Promise<void> | void;
      }) => {
        await options?.onSafeAuthenticated?.("safe-jwt");
        return null;
      }
    );

    render(<DelegateStatementForm form={createForm(defaultValues)} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Submit delegate profile" })
    );

    await waitFor(() =>
      expect(submitDelegateStatementMock).toHaveBeenCalledWith(
        expect.objectContaining({
          address: "0x1234567890123456789012345678901234567890",
          auth: {
            kind: "siwe_jwt",
            jwt: "safe-jwt",
          },
        })
      )
    );

    expect(signMessageAsyncMock).not.toHaveBeenCalled();
  });
});
