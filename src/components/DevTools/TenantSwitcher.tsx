"use client";

import React from "react";
import { useDevTenant } from "@/contexts/DevTenantContext";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { TenantNamespace } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const TENANT_DISPLAY_NAMES: Record<string, string> = {
  [TENANT_NAMESPACES.OPTIMISM]: "Optimism",
  [TENANT_NAMESPACES.ENS]: "ENS",
  [TENANT_NAMESPACES.ETHERFI]: "EtherFi",
  [TENANT_NAMESPACES.UNISWAP]: "Uniswap",
  [TENANT_NAMESPACES.CYBER]: "Cyber",
  [TENANT_NAMESPACES.SCROLL]: "Scroll",
  [TENANT_NAMESPACES.DERIVE]: "Derive",
  [TENANT_NAMESPACES.PGUILD]: "Protocol Guild",
  [TENANT_NAMESPACES.BOOST]: "Boost",
  [TENANT_NAMESPACES.XAI]: "XAI",
  [TENANT_NAMESPACES.B3]: "B3",
  [TENANT_NAMESPACES.DEMO]: "Demo",
  [TENANT_NAMESPACES.LINEA]: "Linea",
  [TENANT_NAMESPACES.TOWNS]: "Towns",
  [TENANT_NAMESPACES.SYNDICATE]: "Syndicate",
  [TENANT_NAMESPACES.DEMO2]: "Demo 2",
  [TENANT_NAMESPACES.DEMO3]: "Demo 3",
  [TENANT_NAMESPACES.DEMO4]: "Demo 4",
};

export function TenantSwitcher() {
  const { selectedTenant, setSelectedTenant, isDevMode } = useDevTenant();

  if (!isDevMode) {
    return null;
  }

  const currentTenant =
    selectedTenant ||
    (process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME as TenantNamespace);

  return (
    <div className="fixed top-4 left-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-yellow-100 border-yellow-400 hover:bg-yellow-200 text-black shadow-lg"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">
              {TENANT_DISPLAY_NAMES[currentTenant] || currentTenant}
            </span>
            <span className="text-xs opacity-70">(DEV)</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" style={{ width: "auto" }}>
          <div className="max-h-96 overflow-y-auto bg-cardBackground">
            <div className="px-2 py-1.5 text-sm font-semibold">
              Switch Tenant Theme
            </div>
            <div className="h-px bg-gray-200 my-1" />
            <DropdownMenuPrimitive.RadioGroup
              value={currentTenant}
              onValueChange={(value: string) =>
                setSelectedTenant(value as TenantNamespace)
              }
            >
              {Object.values(TENANT_NAMESPACES).map((tenant) => (
                <DropdownMenuRadioItem
                  key={tenant}
                  value={tenant}
                  checked={currentTenant === tenant}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-lg p-3 text-base outline-none transition-colors hover:bg-neutral/50",
                    currentTenant === tenant ? "text-primary" : "text-secondary"
                  )}
                >
                  {TENANT_DISPLAY_NAMES[tenant] || tenant}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuPrimitive.RadioGroup>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
