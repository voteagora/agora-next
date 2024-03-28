import React, { useCallback, useContext, useEffect, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { ProposalDraftWithTransactions } from "./types";
import { ProposalChecklist } from "@prisma/client";

interface DraftProposalFormSubmitChecklistProps {
  proposalState: ProposalDraftWithTransactions;
  getProposalChecklist: (proposal_id: string) => Promise<ProposalChecklist[]>;
}

const DraftProposalFormSubmitChecklist: React.FC<
  DraftProposalFormSubmitChecklistProps
> = (props) => {
  const { proposalState, getProposalChecklist } = props;
  const [tempCheckData, setTempCheckData] = useState<ProposalChecklist>();
  const [transactionSimulationData, setTransactionSimulationData] =
    useState<ProposalChecklist>();
  const [draftCreatedData, setDraftCreatedData] = useState<ProposalChecklist>();
  const [ensDocsData, setEnsDocsData] = useState<ProposalChecklist>();

  const getProposalsAndSet = useCallback(async (proposal_id: string) => {
    const tempProposalChecklist = await getProposalChecklist(proposal_id);

    const tempCheckData = tempProposalChecklist.find(
      (check) => check.stage === "temp_check"
    );
    const transactionSimulationData = tempProposalChecklist.find(
      (check) => check.stage === "transaction_simulation"
    );
    const draftCreatedData = tempProposalChecklist.find(
      (check) => check.stage === "draft_created"
    );
    const ensDocsData = tempProposalChecklist.find(
      (check) => check.stage === "update_docs"
    );
    setTempCheckData(tempCheckData);
    setTransactionSimulationData(transactionSimulationData);
    setDraftCreatedData(draftCreatedData);
    setEnsDocsData(ensDocsData);
  }, []);

  useEffect(() => {
    getProposalsAndSet(proposalState.id.toString());
  }, []);

  return (
    <ul className="border border-gray-eo rounded-lg w-full divide-y divide-gray-eo">
      {tempCheckData !== undefined ? (
        <DraftProposalFormSubmitChecklistRow
          title="Discourse Temp Check"
          data={tempCheckData}
        />
      ) : (
        <li className="w-full flex flex-row items-center justify-between p-4 font-medium">
          <p>{`Discourse Temp Check`}</p>
          <div className="flex flex-row items-center">
            <p className="text-xs text-gray-af font-medium">skipped</p>
          </div>
        </li>
      )}
      {proposalState.proposal_type === "executable" && (
        <DraftProposalFormSubmitChecklistRow
          title="Transaction simulation"
          data={transactionSimulationData}
        />
      )}
      <DraftProposalFormSubmitChecklistRow
        title="Draft created and shared on forums"
        data={draftCreatedData}
      />
      <DraftProposalFormSubmitChecklistRow
        title="ENS docs updated"
        data={ensDocsData}
      />
      <li className="w-full flex flex-row items-center justify-between p-4 font-medium">
        <p>{`100k ENS proposal threshold`}</p>
        <div className="flex flex-row items-center">
          <p className="text-xs text-gray-af font-medium">
            required for onchain
          </p>
        </div>
      </li>
    </ul>
  );
};

export default DraftProposalFormSubmitChecklist;

interface DraftProposalFormSubmitChecklistRowProps {
  title: string;
  data: ProposalChecklist | undefined;
}

const DraftProposalFormSubmitChecklistRow: React.FC<
  DraftProposalFormSubmitChecklistRowProps
> = (props) => {
  const { title, data } = props;

  return (
    <li className="w-full flex flex-row items-center justify-between p-4 font-medium">
      <p>{title}</p>
      <div className="flex flex-row items-center">
        {data !== undefined && (
          <p className="text-xs mr-3 text-gray-af font-medium">
            on {data.completed_at.toLocaleDateString()} (by {data.completed_by})
          </p>
        )}
        <Checkbox checked={data !== undefined ? true : false} />
      </div>
    </li>
  );
};
