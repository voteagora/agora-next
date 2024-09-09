import React from "react";
import { Changelog } from "@/app/api/common/changelogs/changelog";
import { formatFullDate } from "@/lib/utils";

interface ChangelogListEntryProps {
  changelogEntry: Changelog;
}

const ChangelogListEntry: React.FC<ChangelogListEntryProps> = ({
  changelogEntry,
}) => {
  return (
    <div className="mt-8">
      <p className="mt-2 text-base leading-7 text-secondary">
        {formatFullDate(new Date(changelogEntry.created_at))}
      </p>
      <h3 className="text-2xl font-semibold leading-7 text-primary">
        {changelogEntry.title || `Changelog Entry #${changelogEntry.id}`}
      </h3>
      <div
        className="mt-2 text-base leading-7 text-secondary"
        dangerouslySetInnerHTML={{ __html: changelogEntry.body }}
      />
    </div>
  );
};

export default ChangelogListEntry;
