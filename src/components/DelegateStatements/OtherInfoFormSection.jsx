import DelegateStatementInputGroup from "./DelegateStatementInputGroup";
import DelegateStatementBoolSelector from "./DelegateStatementBoolSelector";

export default function OtherInfoFormSection({ form }) {
  return (
    <div className="py-8 px-6 border-b border-gray-300">
      <h3 className="font-bold">Other info</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DelegateStatementInputGroup
          title="Twitter"
          placeholder="@yourname"
          value={form.state.twitter}
          onChange={form.onChange.twitter}
        />
        <DelegateStatementInputGroup
          title="Discord"
          placeholder="yourname#2142"
          value={form.state.discord}
          onChange={form.onChange.discord}
        />
        <DelegateStatementInputGroup
          title="Email (will not be public)"
          placeholder="you@gmail.com"
          value={form.state.email}
          onChange={form.onChange.email}
        />

        {/* TODO: form */}
        {/* <YesNoSelector
          selection={form.state.openToSponsoringProposals}
          onSelectionChanged={form.onChange.openToSponsoringProposals}
        /> */}
        <DelegateStatementBoolSelector />
      </div>
    </div>
  );
}
