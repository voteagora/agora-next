"use client";

import React, { useState, useContext } from "react";
import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";

import MarkdownPreview from "@uiw/react-markdown-preview";

// example markdown to test with for the developer convenience :)

// # This is a header
// ## This is a subheader
// this is a paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam, quisque amet, nunc. Sed euismod, diam, quisque amet, nunc.
// ## This is another subheader
// this is another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam, quisque amet, nunc. Sed euismod, diam, quisque amet, nunc.
// this is list:
// - item 1
// - item 2
// - item 3

// this is the end

interface DraftProposalAbstractProps {
  label: string;
  placeholder: string;
}

const DraftProposalAbstract: React.FC<DraftProposalAbstractProps> = (props) => {
  const { label, placeholder } = props;

  // can be markdown
  const { state, updateAbstract } = useContext(ProposalLifecycleDraftContext);
  const [selectedMode, setSelectedMode] = useState<"write" | "preview">(
    "write"
  );

  return (
    <div className="flex flex-col px-6 mb-5">
      <label className="font-medium text-sm mb-1">{label}</label>
      <div className="min-h-[215px] w-full border border-gray-eo rounded-t-lg bg-gray-fa">
        {selectedMode === "write" ? (
          <textarea
            className="py-3 px-4 border-0 placeholder-gray-af w-full bg-gray-fa rounded-t-lg focus:outline-none focus:ring-0 resize-none"
            placeholder={placeholder}
            value={state.abstract}
            onChange={(e) => updateAbstract(e.target.value)}
            rows={8}
          ></textarea>
        ) : (
          <div>
            <MarkdownPreview
              source={state.abstract}
              className="h-full py-3 px-4 rounded-t-lg max-w-[650px] bg-transparent"
              // make background transparent
              style={{
                backgroundColor: "transparent",
              }}
              wrapperElement={{
                "data-color-mode": "light",
              }}
            />
          </div>
        )}
      </div>
      <div className="w-full flex flex-row justify-end py-3 gap-x-1 rounded-b-lg border-x border-b border-gray-eo pr-2">
        <button
          className={`py-2 px-3 rounded-full font-medium ${
            selectedMode === "write" ? "bg-gray-fa text-black" : "text-gray-af"
          }`}
          onClick={() => setSelectedMode("write")}
        >
          Write
        </button>
        <button
          className={`py-2 px-3 rounded-full font-medium ${
            selectedMode === "preview"
              ? "bg-gray-fa text-black"
              : "text-gray-af"
          }`}
          onClick={() => setSelectedMode("preview")}
        >
          Preview
        </button>
      </div>
    </div>
  );
};

export default DraftProposalAbstract;
