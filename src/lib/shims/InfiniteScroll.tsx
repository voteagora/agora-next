import React, {
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";

// We intentionally import from the package's compiled entry to bypass our alias
// mapping of "react-infinite-scroller" → this shim.

const RawInfiniteScroll: ComponentType<any> =
  // Some builds expose the component via `.default`, others directly.
  require("react-infinite-scroller/dist/InfiniteScroll").default ??
  require("react-infinite-scroller/dist/InfiniteScroll");

export type InfiniteScrollProps = {
  children: ReactNode;
  loadMore: (page: number) => void;
  hasMore?: boolean;
  pageStart?: number;
  initialLoad?: boolean;
  threshold?: number;
  useWindow?: boolean;
  useCapture?: boolean;
  getScrollParent?: () => HTMLElement | null;
  className?: string;
  style?: CSSProperties;
  element?:
    | keyof JSX.IntrinsicElements
    | ComponentType<Record<string, unknown>>;
  isReverse?: boolean;
  loader?: ReactNode;
  ref?: Ref<unknown>;
};

const InfiniteScroll = (props: InfiniteScrollProps) => {
  return <RawInfiniteScroll {...props} />;
};

export default InfiniteScroll;
