import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ENSName from "../shared/ENSName";

export default function DelegateProfileDropdown({ address }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">🟢  &nbsp;<ENSName address={address} /></Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4"></div>
            <div className="grid grid-cols-3 items-center gap-4"></div>
            <div className="grid grid-cols-3 items-center gap-4"></div>
            <div className="grid grid-cols-3 items-center gap-4"></div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
