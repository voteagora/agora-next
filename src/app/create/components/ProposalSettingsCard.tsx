import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProposalType, PostType } from "../types";

interface ProposalSettingsCardProps {
  selectedProposalType: ProposalType;
  proposalTypes: ProposalType[];
  onProposalTypeChange: (typeId: string) => void;
  postType: PostType;
}

export function ProposalSettingsCard({
  selectedProposalType,
  proposalTypes,
  onProposalTypeChange,
  postType,
}: ProposalSettingsCardProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-secondary">
            Proposal type
          </Label>
          {postType === "tempcheck" ? (
            <>
              <Select
                value={selectedProposalType?.id || ""}
                onValueChange={onProposalTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {proposalTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProposalType && (
                <p className="text-sm text-tertiary leading-relaxed">
                  {selectedProposalType?.description}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="text-base text-primary font-medium">
                {selectedProposalType?.name}
              </div>
              <p className="text-sm text-tertiary leading-relaxed">
                {selectedProposalType?.description}
              </p>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base text-secondary">Quorum</span>
            <span className="text-sm text-tertiary">
              {`${selectedProposalType?.quorum}%`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base text-secondary">Approval threshold</span>
            <span className="text-sm text-tertiary">
              {`${selectedProposalType?.approvalThreshold}%`}
            </span>
          </div>
          {/* TODO <div className="flex justify-between items-center">
            <span className="text-base text-secondary">Vote duration</span>
            <span className="text-sm text-tertiary">
              {selectedProposalType.voteDuration} days
            </span>
          </div> */}
        </div>
      </CardContent>

      <div className="border-t border-line px-6 py-4">
        <p className="text-xs text-tertiary leading-relaxed">
          All proposal type selections must be approved by the DUNA admin before
          the vote is allowed to pass.
        </p>
      </div>
    </Card>
  );
}
