"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export const useAddSearchParam = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    return useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams?.toString());
            params.set(name, value);
            return pathname + "?" + params.toString();
        },
        [searchParams, pathname]
    );
}
