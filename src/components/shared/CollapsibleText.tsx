import React, { useState, useMemo } from "react";

export const CollapsibleText = ({
  text,
  maxLength = 100,
}: {
  text: string;
  maxLength?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldTruncate = text.length > maxLength;

  const displayText = useMemo(() => {
    if (!shouldTruncate || isExpanded) return text;
    return text.slice(0, maxLength).trim();
  }, [text, maxLength, isExpanded, shouldTruncate]);

  if (!shouldTruncate) return text;

  return (
    <span>
      {displayText}
      {!isExpanded && "..."}{" "}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="font-bold focus:outline-none"
      >
        {isExpanded ? "less" : "more"}
      </button>
    </span>
  );
};
