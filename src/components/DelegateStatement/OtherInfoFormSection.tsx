import DelegateStatementInputGroup from "./DelegateStatementInputGroup";
import DelegateStatementBoolSelector, {
  DelegateStatementDaoPrinciplesSelector,
} from "./DelegateStatementBoolSelector";
import { type UseFormReturn } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import Tenant from "@/lib/tenant/tenant";

export default function OtherInfoFormSection({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const { ui } = Tenant.current();
  const requireCodeOfConduct = ui.toggle("delegates/code-of-conduct")?.enabled;
  const requireDaoPrinciples = ui.toggle("delegates/dao-principles")?.enabled;
  const canManageProfileMetadata = ui.toggle(
    "delegates/profile-metadata"
  )?.enabled;
  const hideDiscordInput = ui.toggle("delegates/hide-discord-input")?.enabled;
  const hideWarpcastInput = ui.toggle("delegates/hide-warpcast-input")?.enabled;

  return (
    <div className="py-8 px-6 border-b border-line">
      <h3 className="font-bold text-primary">Other info</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {canManageProfileMetadata && (
          <>
            <DelegateStatementInputGroup
              title="Display name"
              placeholder="Your name"
              name="username"
              form={form}
            />
            <DelegateStatementInputGroup
              title="Avatar URL"
              placeholder="https://example.com/avatar.png"
              name="avatar"
              form={form}
            />
          </>
        )}
        <DelegateStatementInputGroup
          title="X (formerly Twitter)"
          placeholder="@yourname"
          name="twitter"
          form={form}
        />
        {!hideWarpcastInput && (
          <DelegateStatementInputGroup
            title="Warpcast"
            placeholder="@yourname"
            name="warpcast"
            form={form}
          />
        )}
        {!hideDiscordInput && (
          <DelegateStatementInputGroup
            title="Discord"
            placeholder="yourname#2142"
            name="discord"
            form={form}
          />
        )}
        <div className="col-span-full">
          {requireCodeOfConduct && (
            <DelegateStatementBoolSelector form={form} />
          )}
          {requireDaoPrinciples && (
            <DelegateStatementDaoPrinciplesSelector form={form} />
          )}
        </div>
      </div>
    </div>
  );
}
