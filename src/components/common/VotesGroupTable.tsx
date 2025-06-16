import React from "react";

type VoteGroup = {
  name: string;
  [key: string]: any; // For flexible properties
};

type ColumnConfig = {
  key: string;
  header: string;
  width?: string;
  textColorClass?: string;
  formatter?: (value: any) => string | React.ReactNode;
};

type VotesGroupTableProps = {
  groups: VoteGroup[];
  columns: ColumnConfig[];
  showBorder?: boolean;
};

export const VotesGroupTable: React.FC<VotesGroupTableProps> = ({
  groups,
  columns,
  showBorder = false,
}) => {
  return (
    <div
      className={`self-stretch px-3 pt-4 pb-3 bg-white inline-flex flex-col gap-4 w-full ${showBorder ? "border-t border-line" : ""}`}
    >
      {/* Header */}
      <div className="inline-flex justify-between items-center font-semibold uppercase leading-none text-tertiary text-[9px]">
        <div className="text-[9px]">Group</div>
        <div className="flex justify-between items-center">
          {columns.map((column) => (
            <div
              key={column.key}
              className={`text-right ${column.width || "w-[60px]"}`}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Vote Groups */}
      {groups.map((group, index) => (
        <div
          key={index}
          className="self-stretch inline-flex justify-between items-center font-semibold"
        >
          <div className="text-primary text-xs leading-none">{group.name}</div>
          <div className="flex justify-between items-center">
            {columns.map((column) => (
              <div
                key={column.key}
                className={`flex justify-end items-center ${column.width || "w-[60px]"}`}
              >
                <div
                  className={`text-xs leading-tight ${column.textColorClass || "text-primary"}`}
                >
                  {column.formatter
                    ? column.formatter(group[column.key])
                    : group[column.key]}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VotesGroupTable;
