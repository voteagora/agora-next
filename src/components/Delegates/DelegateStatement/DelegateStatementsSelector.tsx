"use client";

import TopStakeholders from "./TopStakeholders";
import TopIssues from "./TopIssues";
import { useState, useEffect } from "react";
import { DelegateStatement as DelegateStatementType } from "@/app/api/common/delegates/delegate";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import { useDelegateStatementStore } from "@/stores/delegateStatement";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Markdown from "@/components/shared/Markdown/Markdown";
import { sanitizeContent } from "@/lib/sanitizationUtils";
import { HistoryIcon } from "@/icons/History";

interface Props {
  delegateStatements: DelegateStatementType[];
}

export const DelegateStatementsSelector = ({ delegateStatements }: Props) => {
  const [selectedStatement, setSelectedStatement] =
    useState<DelegateStatementType>(delegateStatements?.[0]);

  // From DelegateStatementContainer
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();
  const showSuccessMessage = useDelegateStatementStore(
    (state) => state.showSaveSuccess
  );
  const setSaveSuccess = useDelegateStatementStore(
    (state) => state.setSaveSuccess
  );

  const { isSelectedPrimaryAddress } = useSelectedWallet();
  const delegateStatement = selectedStatement?.payload?.delegateStatement;

  useEffect(() => {
    const handleBeforeUnload = () => {
      setSaveSuccess(false);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [setSaveSuccess]);

  const handleStatementSelect = (statement: DelegateStatementType) => {
    setSelectedStatement(statement);
  };

  const sanitizedStatement = sanitizeContent(
    selectedStatement?.payload?.delegateStatement
  );

  return (
    <div className="space-y-4">
      <>
        {showSuccessMessage && !isSelectedPrimaryAddress && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4"
            role="alert"
          >
            <p className="font-bold">Statement Saved</p>
            <p>
              Nice! Thank you for telling the community what you believe in.
            </p>
          </div>
        )}

        {!delegateStatement && selectedStatement && (
          <div className="p-8 text-center text-secondary align-middle bg-wash rounded-xl">
            <p className="break-words">
              No delegate statement for this account
            </p>
            {isConnected && (
              <p className="my-3">
                <a
                  rel="noopener"
                  target="_blank"
                  className="underline"
                  href="/delegates/create"
                >
                  Create your delegate statement
                </a>
              </p>
            )}
          </div>
        )}

        {delegateStatement && (
          <div className="flex flex-col bg-neutral rounded-xl mb-4 p-6 gap-4 border border-line">
            <h2 className="text-2xl font-bold text-primary relative">
              Delegate Statement
              {delegateStatements.length > 1 && (
                <div className="mb-4 absolute right-0 top-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="md:w-auto flex items-center justify-between"
                      >
                        <HistoryIcon className="mr-2 h-4 w-4 stroke-primary" />
                        <span>History</span>
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-auto">
                      {delegateStatements.map((statement, index) => (
                        <DropdownMenuItem
                          key={statement.signature || index}
                          onSelect={() => handleStatementSelect(statement)}
                          className={`text-sm px-6 py-2 ${selectedStatement === statement ? "bg-muted" : ""}`}
                        >
                          {statement.updatedAt
                            ? new Date(
                                statement.updatedAt
                              ).toLocaleDateString() +
                              " " +
                              new Date(statement.updatedAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : `Statement ${index + 1}`}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </h2>

            <Markdown content={sanitizedStatement} />
          </div>
        )}
      </>

      {/* Top Issues and Stakeholders */}
      {selectedStatement?.payload && (
        <>
          <TopIssues statement={selectedStatement} />
          <TopStakeholders statement={selectedStatement} />
        </>
      )}
    </div>
  );
};
