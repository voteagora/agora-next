import ChangelogFAQs from "./ChangelogFAQs";
import NewEntry from "./NewEntry";

export default function ChangelogEntryForm() {
  return (
    <div className="space-y-8 sm:space-y-0 sm:flex sm:gap-12 mt-12">
      <div className="space-y-8 sm:flex-grow">
        <NewEntry />
      </div>
      <ChangelogFAQs />
    </div>
  );
}
