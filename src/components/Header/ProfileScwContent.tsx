import { rgbStringToHex } from "@/app/lib/utils/color";
import { CubeIcon } from "@/icons/CubeIcon";
import Tenant from "@/lib/tenant/tenant";
import { shortAddress } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export const ProfileScwContent = ({ scwAddress }: { scwAddress: string }) => {
  const { ui } = Tenant.current();
  return (
    <>
      <div className="block sm:hidden">
        <div className="w-[60px] flex justify-center items-center">
          <div className="border-l border-dashed border-line h-2"></div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="w-[60px] flex justify-center items-center">
            <div className="flex items-center justify-center rounded-full border border-line w-[30px] h-[30px]">
              <CubeIcon
                className="w-5 h-5"
                fill={rgbStringToHex(ui?.customization?.primary)}
              />
            </div>
          </div>
          <div className="text-primary">{shortAddress(scwAddress)}</div>
        </div>
      </div>
      <div className="hidden sm:block">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex flex-row space-x-1 items-center">
              <div className="flex flex-row items-center gap-2">
                <div className="w-[60px] flex justify-center items-center">
                  <div className="flex items-center justify-center rounded-full border border-line w-[30px] h-[30px]">
                    <CubeIcon
                      className="w-5 h-5"
                      fill={rgbStringToHex(ui?.customization?.primary)}
                    />
                  </div>
                </div>
                <div className="text-primary">{shortAddress(scwAddress)}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs max-w-[250px] p-3">
              <div className="text-primary">Smart Contract Wallet</div>
              <div className="text-xs text-secondary font-light">
                Your SCW is where your governance power comes from. Your stkDRV
                tokens establish your voting power or how much you can delegate
                to another member.
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};
