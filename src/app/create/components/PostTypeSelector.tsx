import React, { useLayoutEffect, useRef, useState } from "react";
import { PostType, postTypeOptions } from "../types";

interface PostTypeSelectorProps {
  value: PostType;
  onChange: (type: PostType) => void;
}

export function PostTypeSelector({ value, onChange }: PostTypeSelectorProps) {
  const [activeIndicator, setActiveIndicator] = useState({ left: 0, width: 0 });
  const selectorRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<PostType, HTMLButtonElement | null>>({
    tempcheck: null,
    "gov-proposal": null,
  });

  useLayoutEffect(() => {
    const buttonElement = buttonRefs.current[value];
    const selectorElement = selectorRef.current;

    if (buttonElement && selectorElement) {
      const rect = buttonElement.getBoundingClientRect();
      const selectorRect = selectorElement.getBoundingClientRect();

      setActiveIndicator({
        left: rect.left - selectorRect.left,
        width: rect.width,
      });
    }
  }, [value]);

  return (
    <div
      ref={selectorRef}
      className="relative flex flex-row rounded-full border border-line p-1 font-medium bg-wash"
    >
      <div
        className="absolute rounded-full shadow-newDefault transition-all duration-150 ease-in-out h-[38px] bg-white"
        style={{
          left: `${activeIndicator.left}px`,
          width: `${activeIndicator.width}px`,
          opacity: activeIndicator.width ? 1 : 0,
        }}
      />
      {Object.entries(postTypeOptions).map(([key, label]) => (
        <button
          key={key}
          ref={(el) => {
            buttonRefs.current[key as PostType] = el;
          }}
          onClick={() => onChange(key as PostType)}
          className={`relative z-10 px-4 py-2 rounded-full transition-colors duration-150 ${
            value === key
              ? "text-primary"
              : "text-tertiary hover:text-secondary"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
