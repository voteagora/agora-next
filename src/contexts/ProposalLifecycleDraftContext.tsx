"use client";

import React, { createContext, useReducer, ReactNode, useEffect } from "react";

interface ProposalTransaction {
  order: number;
  target: string;
  value: string;
  calldata: string;
  functionDetails: string;
  contractABI: string;
  description: string;
  isValid: boolean;
}

interface ProposalLifecycleDraft {
  tempCheckLink: string;
  proposalType: "executable" | "social";
  title: string;
  description: string;
  abstract: string;
  auditURL: string;
  updateENSDocsStatus: boolean;
  postOnDiscourseStatus: boolean;
  transactions: ProposalTransaction[];
}

type ProposalLifecycleDraftUpdateFunction =
  | { type: "UPDATE_TEMP_CHECK_LINK"; payload: string }
  | { type: "UPDATE_PROPOSAL_TYPE"; payload: "executable" | "social" }
  | { type: "UPDATE_TITLE"; payload: string }
  | { type: "UPDATE_DESCRIPTION"; payload: string }
  | { type: "UPDATE_ABSTRACT"; payload: string }
  | { type: "UPDATE_AUDIT_URL"; payload: string }
  | { type: "UPDATE_ENS_DOCS_STATUS"; payload: boolean }
  | { type: "UPDATE_DISCOURSE_STATUS"; payload: boolean }
  | { type: "ADD_TRANSACTION" }
  | {
      type: "UPDATE_TRANSACTION";
      payload: {
        order: number;
        fieldName: keyof ProposalTransaction;
        value: string | boolean;
      };
    };

const initialState: ProposalLifecycleDraft = {
  tempCheckLink: "",
  proposalType: "executable",
  title: "",
  description: "",
  abstract: "",
  auditURL: "",
  updateENSDocsStatus: true,
  postOnDiscourseStatus: true,
  transactions: [],
};

// Define the reducer function to handle state updates
const reducer = (
  state: ProposalLifecycleDraft,
  action: ProposalLifecycleDraftUpdateFunction
) => {
  switch (action.type) {
    case "UPDATE_TEMP_CHECK_LINK":
      return { ...state, tempCheckLink: action.payload };
    case "UPDATE_PROPOSAL_TYPE":
      return { ...state, proposalType: action.payload };
    case "UPDATE_TITLE":
      return { ...state, title: action.payload };
    case "UPDATE_DESCRIPTION":
      return { ...state, description: action.payload };
    case "UPDATE_ABSTRACT":
      return { ...state, abstract: action.payload };
    case "UPDATE_AUDIT_URL":
      return { ...state, auditURL: action.payload };
    case "UPDATE_ENS_DOCS_STATUS":
      return { ...state, updateENSDocsStatus: action.payload };
    case "UPDATE_DISCOURSE_STATUS":
      return { ...state, postOnDiscourseStatus: action.payload };
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [
          ...state.transactions,
          {
            order: state.transactions.length,
            target: "",
            value: "",
            calldata: "",
            functionDetails: "",
            contractABI: "",
            description: "",
            isValid: false,
          },
        ],
      };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((transaction) => {
          if (transaction.order === action.payload.order) {
            return {
              ...transaction,
              [action.payload.fieldName]: action.payload.value,
            };
          }

          return transaction;
        }),
      };
    default:
      return state;
  }
};

export const ProposalLifecycleDraftContext = createContext<{
  proposalState: ProposalLifecycleDraft;
  updateTempCheckLink: (tempCheckLink: string) => void;
  updateProposalType: (proposalType: "executable" | "social") => void;
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
  updateAbstract: (abstract: string) => void;
  updateAuditURL: (auditURL: string) => void;
  updateENSDocsStatus: (updateENSDocsStatus: boolean) => void;
  updateDiscourseStatus: (postOnDiscourseStatus: boolean) => void;
  addTransaction: () => void;
  updateTransaction: (
    order: number,
    fieldName: keyof ProposalTransaction,
    value: string | boolean
  ) => void;
}>({
  proposalState: initialState,
  updateTempCheckLink: () => {},
  updateProposalType: () => {},
  updateTitle: () => {},
  updateDescription: () => {},
  updateAbstract: () => {},
  updateAuditURL: () => {},
  updateENSDocsStatus: () => {},
  updateDiscourseStatus: () => {},
  addTransaction: () => {},
  updateTransaction: () => {},
});

export const ProposalLifecycleDraftProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [proposalState, dispatch] = useReducer(reducer, initialState);

  const updateTempCheckLink = (tempCheckLink: string) => {
    localStorage.setItem("new-proposal-draft-tempcheck-link", tempCheckLink);
    dispatch({ type: "UPDATE_TEMP_CHECK_LINK", payload: tempCheckLink });
  };

  const updateProposalType = (proposalType: "executable" | "social") => {
    localStorage.setItem("new-proposal-draft-proposal-type", proposalType);
    dispatch({ type: "UPDATE_PROPOSAL_TYPE", payload: proposalType });
  };

  const updateTitle = (title: string) => {
    localStorage.setItem("new-proposal-draft-title", title);
    dispatch({ type: "UPDATE_TITLE", payload: title });
  };

  const updateDescription = (description: string) => {
    localStorage.setItem("new-proposal-draft-description", description);
    dispatch({ type: "UPDATE_DESCRIPTION", payload: description });
  };

  const updateAbstract = (abstract: string) => {
    localStorage.setItem("new-proposal-draft-abstract", abstract);
    dispatch({ type: "UPDATE_ABSTRACT", payload: abstract });
  };

  const updateAuditURL = (auditURL: string) => {
    dispatch({ type: "UPDATE_AUDIT_URL", payload: auditURL });
  };

  const updateENSDocsStatus = (updateENSDocsStatus: boolean) => {
    dispatch({ type: "UPDATE_ENS_DOCS_STATUS", payload: updateENSDocsStatus });
  };

  const updateDiscourseStatus = (postOnDiscourseStatus: boolean) => {
    dispatch({
      type: "UPDATE_DISCOURSE_STATUS",
      payload: postOnDiscourseStatus,
    });
  };

  const addTransaction = () => {
    dispatch({
      type: "ADD_TRANSACTION",
    });
  };

  const updateTransaction = (
    order: number,
    fieldName: keyof ProposalTransaction,
    value: string | boolean
  ) => {
    dispatch({
      type: "UPDATE_TRANSACTION",
      payload: { order: order, fieldName: fieldName, value: value },
    });
  };

  useEffect(() => {
    const tempCheckLink = localStorage.getItem(
      "new-proposal-draft-tempcheck-link"
    );
    if (tempCheckLink) {
      updateTempCheckLink(tempCheckLink);
    }

    const proposalType = localStorage.getItem(
      "new-proposal-draft-proposal-type"
    );
    if (proposalType) {
      updateProposalType(proposalType as "executable" | "social");
    }

    const title = localStorage.getItem("new-proposal-draft-title");
    if (title) {
      updateTitle(title);
    }

    const description = localStorage.getItem("new-proposal-draft-description");
    if (description) {
      updateDescription(description);
    }

    const abstract = localStorage.getItem("new-proposal-draft-abstract");
    if (abstract) {
      updateAbstract(abstract);
    }
  }, []);

  return (
    <ProposalLifecycleDraftContext.Provider
      value={{
        proposalState,
        updateTempCheckLink,
        updateProposalType,
        updateTitle,
        updateDescription,
        updateAbstract,
        updateAuditURL,
        updateENSDocsStatus,
        updateDiscourseStatus,
        addTransaction,
        updateTransaction,
      }}
    >
      {children}
    </ProposalLifecycleDraftContext.Provider>
  );
};
