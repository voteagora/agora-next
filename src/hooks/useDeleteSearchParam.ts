"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export const useDeleteSearchParam = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    return useCallback(
        ({ name, clean }: { name: string, clean?: boolean }) => {
            const params = new URLSearchParams(clean ? undefined : searchParams?.toString());
            params.delete(name);
            return pathname + "?" + params.toString();
        },
        [searchParams, pathname]
    );
}
