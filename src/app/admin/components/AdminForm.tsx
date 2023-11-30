"use client"

import ProposalTypeSettings from "./ProposalTypeSettings"
import GovernorSettings from "./GovernorSettings"

// TODO: Take init values from the chain
export default function AdminForm() {
  return (
    <div className="space-y-8">
      <GovernorSettings />
      <ProposalTypeSettings />
    </div>
  )
}
