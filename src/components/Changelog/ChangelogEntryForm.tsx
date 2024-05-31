import ChangelogFAQs from "./ChangelogFAQs";

export default function ChangelogEntryForm() {
  return (
    <div className="space-y-8 sm:space-y-0 sm:flex sm:gap-12 mt-12">
      <div className="space-y-8 sm:flex-grow">
        <h1>Add Changelog Entry</h1>
      </div>
      <ChangelogFAQs />
    </div>
  );
}
