declare module "react-infinite-scroller" {
  import type { ComponentType, HTMLAttributes, ReactNode } from "react";

  export interface InfiniteScrollProps extends HTMLAttributes<HTMLElement> {
    element?: ReactNode | string;
    hasMore?: boolean;
    initialLoad?: boolean;
    isReverse?: boolean;
    loadMore(page: number): void;
    pageStart?: number;
    threshold?: number;
    useCapture?: boolean;
    useWindow?: boolean;
    loader?: ReactNode;
    getScrollParent?(): HTMLElement | null;
  }

  const InfiniteScroll: ComponentType<InfiniteScrollProps>;

  export default InfiniteScroll;
}
