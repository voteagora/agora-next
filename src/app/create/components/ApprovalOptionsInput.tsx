"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/shared/Switch";
import { XMarkIcon, PlusIcon } from "@heroicons/react/20/solid";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import {
  ApprovalOption,
  ApprovalProposalSettings,
  ApprovalCriteria,
} from "../types";

interface ApprovalOptionsInputProps {
  settings: ApprovalProposalSettings;
  onChange: (settings: ApprovalProposalSettings) => void;
}

// Label component with optional tooltip (matching draft form pattern)
function InputLabel({
  label,
  tooltip,
  required,
}: {
  label: string;
  tooltip?: string;
  required?: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex flex-row items-center space-x-1">
          <Label className="text-xs font-semibold text-secondary">
            {label}
            {required && <span className="text-negative ml-0.5">*</span>}
          </Label>
          {tooltip && (
            <QuestionMarkCircleIcon className="h-4 w-4 text-secondary" />
          )}
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent className="text-sm max-w-[200px]">
            {tooltip}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

export function ApprovalOptionsInput({
  settings,
  onChange,
}: ApprovalOptionsInputProps) {
  const [newOptionTitle, setNewOptionTitle] = useState("");

  const handleAddOption = () => {
    if (!newOptionTitle.trim()) return;

    const newOption: ApprovalOption = {
      id: `option-${Date.now()}`,
      title: newOptionTitle.trim(),
    };

    onChange({
      ...settings,
      choices: [...settings.choices, newOption],
    });
    setNewOptionTitle("");
  };

  const handleRemoveOption = (id: string) => {
    onChange({
      ...settings,
      choices: settings.choices.filter((opt) => opt.id !== id),
    });
  };

  const handleBudgetChange = (value: string) => {
    if (value === "") {
      onChange({
        ...settings,
        budget: 0,
      });
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 0) {
        onChange({
          ...settings,
          budget: num,
        });
      }
    }
  };

  const handleMaxApprovalsChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1) {
      onChange({
        ...settings,
        maxApprovals: num,
      });
    }
  };

  const handleCriteriaChange = (selected: string) => {
    const criteria: ApprovalCriteria =
      selected === "Threshold" ? "threshold" : "top-choices";
    onChange({
      ...settings,
      criteria,
      criteriaValue: 0, // Reset value when criteria changes
    });
  };

  const handleCriteriaValueChange = (value: string) => {
    if (value === "") {
      onChange({
        ...settings,
        criteriaValue: 0,
      });
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 0) {
        onChange({
          ...settings,
          criteriaValue: num,
        });
      }
    }
  };

  const criteriaLabel =
    settings.criteria === "threshold" ? "Threshold" : "Top choices";

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-secondary font-semibold">Approval parameters</h3>
        <p className="mt-2 text-sm text-secondary">
          Use the following settings to set the parameters of this vote as well
          as the methodology for determining which options can be executed.
        </p>
      </div>

      {/* Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Budget */}
        <div className="space-y-2">
          <InputLabel
            label="Budget"
            tooltip="This is the maximum number of tokens that can be transferred from all the options in this proposal."
          />
          <Input
            type="number"
            min={0}
            value={settings.budget || ""}
            onChange={(e) => handleBudgetChange(e.target.value)}
            placeholder="0"
            className="bg-wash border-line"
          />
        </div>

        {/* Max Options */}
        <div className="space-y-2">
          <InputLabel
            label="Max options"
            required
            tooltip="Determines up to how many options each voter may select."
          />
          <Input
            type="number"
            min={1}
            value={settings.maxApprovals}
            onChange={(e) => handleMaxApprovalsChange(e.target.value)}
            placeholder="1"
            className="bg-wash border-line"
          />
        </div>

        {/* Criteria Switch */}
        <div className="space-y-2">
          <InputLabel label="Criteria" required />
          <Switch
            options={["Threshold", "Top choices"]}
            selection={criteriaLabel}
            onSelectionChanged={handleCriteriaChange}
          />
        </div>

        {/* Threshold or Top Choices Value */}
        {settings.criteria === "threshold" && (
          <div className="space-y-2">
            <InputLabel
              label="Threshold"
              required
              tooltip="This is the minimum number of votes an option must have to be considered a winner"
            />
            <Input
              type="number"
              min={1}
              value={settings.criteriaValue || ""}
              onChange={(e) => handleCriteriaValueChange(e.target.value)}
              placeholder="1"
              className="bg-wash border-line"
            />
          </div>
        )}

        {settings.criteria === "top-choices" && (
          <div className="space-y-2">
            <InputLabel
              label="Top choices"
              required
              tooltip="This is how many of the most voted for options win."
            />
            <Input
              type="number"
              min={1}
              max={settings.choices.length || undefined}
              value={settings.criteriaValue || ""}
              onChange={(e) => handleCriteriaValueChange(e.target.value)}
              placeholder="1"
              className="bg-wash border-line"
            />
          </div>
        )}
      </div>

      {/* Options Section */}
      <div className="pt-4 border-t border-line">
        <div>
          <h3 className="text-secondary font-semibold">Voting Options</h3>
          <p className="mt-2 text-sm text-secondary">
            Add the choices that voters can select from. Each option represents
            a possible outcome.
          </p>
        </div>

        {/* Options List */}
        <div className="mt-4 space-y-3">
          {settings.choices.map((option, index) => (
            <div
              key={option.id}
              className="flex items-center p-3 border border-line rounded-lg"
            >
              <span className="text-sm font-semibold text-secondary mr-3">
                Option #{index + 1}
              </span>
              <span className="flex-1 text-sm text-primary">
                {option.title}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveOption(option.id)}
                className="p-1 hover:bg-wash rounded text-negative"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Option Input */}
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Enter option title..."
            value={newOptionTitle}
            onChange={(e) => setNewOptionTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddOption();
              }
            }}
            className="flex-1 bg-wash border-line"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddOption}
            disabled={!newOptionTitle.trim()}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add option
          </Button>
        </div>

        {settings.choices.length === 0 && (
          <div className="text-center py-6 text-sm text-tertiary">
            Add at least 1 option for approval voting
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-3 bg-wash rounded-lg">
        <p className="text-xs text-secondary">
          <strong>How it works:</strong>{" "}
          {settings.criteria === "threshold"
            ? `All options that receive more than ${settings.criteriaValue || 0} votes will be approved.`
            : `The top ${settings.criteriaValue || 1} option${settings.criteriaValue !== 1 ? "s" : ""} with the most votes will be approved.`}
          {settings.maxApprovals > 1
            ? ` Each voter can select up to ${settings.maxApprovals} options.`
            : " Each voter can select 1 option."}
        </p>
      </div>
    </div>
  );
}
