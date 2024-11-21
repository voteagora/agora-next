"use client";

import { useState } from "react";
import { Switch } from "@/components/shared/Switch";

const voteFilterOptions = {
  ["Voters"]: {
    sortKey: "voters",
  },
  ["Hasn't voted"]: {
    sortKey: "nonVoters",
  },
};

const ProposalVotesFilter = ({
  initialSelection,
  onSelectionChange,
}: {
  initialSelection: string;
  onSelectionChange: (value: string) => void;
}) => {
  const [value, setValue] = useState(initialSelection);

  return (
    <Switch
      options={Object.entries(voteFilterOptions).map(([key]) => key)}
      selection={value}
      onSelectionChanged={(value: any) => {
        setValue(value);
        onSelectionChange(value);
      }}
    />
  );
};

export default ProposalVotesFilter;
