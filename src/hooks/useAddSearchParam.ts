"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export const useAddSearchParam = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    return useCallback(
        ({ name, value, clean }: { name: string, value: string, clean?: boolean }) => {
            const params = new URLSearchParams(clean ? undefined : searchParams?.toString());
            params.set(name, value);
            return pathname + "?" + params.toString();
        },
        [searchParams, pathname]
    );
}
