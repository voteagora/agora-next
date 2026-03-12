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
const openDialogMock = vi.fn();
const submitDelegateStatementMock = vi.fn();
const signMessageAsyncMock = vi.fn();
const setSaveSuccessMock = vi.fn();
const ensureSiweSessionMock = vi.fn();
const originalDelegateStatementAuthMode =
  process.env.NEXT_PUBLIC_DELEGATE_STATEMENT_AUTH_MODE;

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
  useWalletClient: vi.fn(() => ({})),
  useSignMessage: vi.fn(() => ({
    signMessageAsync: signMessageAsyncMock,
  })),
}));

vi.mock("@/app/delegates/actions", () => ({
  submitDelegateStatement: (...args: unknown[]) =>
    submitDelegateStatementMock(...args),
}));

vi.mock("@/components/Dialogs/DialogProvider/DialogProvider", () => ({
  useOpenDialog: () => openDialogMock,
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

vi.mock("@/lib/utils", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/utils")>("@/lib/utils");

  return {
    ...actual,
    isSafeWallet: vi.fn(),
  };
});

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
    process.env.NEXT_PUBLIC_DELEGATE_STATEMENT_AUTH_MODE = "siwe_jwt";
    ensureSiweSessionMock.mockResolvedValue("jwt-token");
    signMessageAsyncMock.mockResolvedValue("0xabc123");
    submitDelegateStatementMock.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    process.env.NEXT_PUBLIC_DELEGATE_STATEMENT_AUTH_MODE =
      originalDelegateStatementAuthMode;
  });

  it("submits with a SIWE JWT for EOAs by default", async () => {
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
    expect(openDialogMock).not.toHaveBeenCalled();
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

  it("opens the shared Safe raw-message dialog when the rollback mode is enabled", async () => {
    process.env.NEXT_PUBLIC_DELEGATE_STATEMENT_AUTH_MODE = "signed_message";
    const { isSafeWallet } = await import("@/lib/utils");
    vi.mocked(isSafeWallet).mockResolvedValue(true);

    render(<DelegateStatementForm form={createForm(defaultValues)} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Submit delegate profile" })
    );

    await waitFor(() =>
      expect(openDialogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "SAFE_OFFCHAIN_SIGNING",
          params: expect.objectContaining({
            safeAddress: "0x1234567890123456789012345678901234567890",
            purpose: "delegate_statement",
            signingKind: "raw_message",
            signMessage: signMessageAsyncMock,
            onCompleted: expect.any(Function),
          }),
        })
      )
    );

    expect(submitDelegateStatementMock).not.toHaveBeenCalled();
    expect(ensureSiweSessionMock).not.toHaveBeenCalled();
  });

  it("keeps the direct sign-and-submit path for EOAs in rollback mode", async () => {
    process.env.NEXT_PUBLIC_DELEGATE_STATEMENT_AUTH_MODE = "signed_message";
    const { isSafeWallet } = await import("@/lib/utils");
    vi.mocked(isSafeWallet).mockResolvedValue(false);

    render(<DelegateStatementForm form={createForm(defaultValues)} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Submit delegate profile" })
    );

    await waitFor(() => expect(signMessageAsyncMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(submitDelegateStatementMock).toHaveBeenCalledWith(
        expect.objectContaining({
          address: "0x1234567890123456789012345678901234567890",
          delegateStatement: expect.objectContaining({
            delegateStatement: "Delegate statement body",
          }),
          auth: {
            kind: "signed_message",
            signature: "0xabc123",
            chainId: 1,
          },
        })
      )
    );
    expect(pushMock).toHaveBeenCalledWith(
      "/delegates/0x1234567890123456789012345678901234567890"
    );
    expect(ensureSiweSessionMock).not.toHaveBeenCalled();
  });
});
