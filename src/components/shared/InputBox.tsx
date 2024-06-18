"use client";

export default function InputBox({
  placeholder,
  onChange,
  value,
  ...props
}: {
  placeholder: string;
  value: any;
  onChange: (next: any) => void;
  [key: string]: any;
}) {
  return (
    <input
      className="w-full py-2 px-4 rounded-md text-base bg-theme-100 border-theme-300"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onWheel={(e) => e.currentTarget.blur()}
      {...props}
    />
  );
}
