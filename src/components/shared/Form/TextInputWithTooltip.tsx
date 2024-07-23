"use client";

import React, { MutableRefObject, useState } from "react";

type Props = {
  className?: string;
  placeholder?: string;
  inputRef?: MutableRefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  tooltipMessage?: string;
  defaultValue?: string;
};

export function TextInputWithTooltip({
  className,
  onChange,
  inputRef,
  placeholder,
  tooltipMessage,
  defaultValue,
}: Props) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const handleInputClick = () => {
    setIsTooltipVisible(true);
  };

  const handleInputBlur = () => {
    setIsTooltipVisible(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <TextInputTooltip
        className={className}
        placeholder={placeholder}
        inputRef={inputRef}
        defaultValue={defaultValue}
        onChange={onChange}
        onClick={handleInputClick}
        onBlur={handleInputBlur}
      />
      {isTooltipVisible && (
        <div className="absolute bg-black bg-opacity-75 text-neutral rounded-[4px] py-1 px-2 text-xs bottom-[100%] left-0 mb-1 z-50">
          {tooltipMessage}
        </div>
      )}
    </div>
  );
}

type TextInputTooltipProps = {
  className?: string;
  placeholder?: string;
  inputRef?: MutableRefObject<HTMLInputElement | null>;
  defaultValue?: string;
  onChange: (value: string) => void;
  onClick?: () => void;
  onBlur?: () => void;
};

export function TextInputTooltip({
  className,
  onChange,
  placeholder,
  inputRef,
  defaultValue,
  onClick,
  onBlur,
}: TextInputTooltipProps) {
  return (
    <input
      className={className}
      type="text"
      ref={inputRef}
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={(event) => onChange(event.target.value)}
      onClick={onClick}
      onBlur={onBlur}
      autoComplete="off"
      data-1p-ignore
    />
  );
}
