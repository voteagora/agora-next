import { ConnectKitButton } from "connectkit";
import { DesktopProfileDropDown } from "./DesktopProfileDropDown";
import { ArrowRight } from "@/icons/ArrowRight";
import { cn } from "@/lib/utils";

export function DesktopConnectButton({
  hasNotDelegated,
}: {
  hasNotDelegated: boolean;
}) {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, ensName }) => {
        return (
          <div
            onClick={!isConnected ? () => show?.() : undefined}
            className={cn(
              "lg:border text-primary lg:bg-neutral py-2 px-4 rounded-full cursor-pointer hidden sm:flex items-center transition-all hover:shadow-newDefault h-[48px] relative",
              isConnected ? "lg:border-line" : "lg:border-primary"
            )}
          >
            {isConnected ? (
              <>
                <DesktopProfileDropDown ensName={ensName} />
                {hasNotDelegated && (
                  <div className="w-[10px] h-[10px] bg-negative rounded-full absolute left-9 top-3"></div>
                )}
              </>
            ) : (
              <>
                {"Connect Wallet"}{" "}
                <ArrowRight className="ml-3 mr-1 hidden lg:block stroke-primary" />
              </>
            )}
          </div>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
