import React, {
  type ComponentType,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

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
  element?: ElementType;
  isReverse?: boolean;
  loader?: ReactNode;
};

const getScrollTop = () => {
  const doc =
    document.documentElement || document.body.parentNode || document.body;
  return window.pageYOffset !== undefined ? window.pageYOffset : doc.scrollTop;
};

const InfiniteScroll = forwardRef<HTMLElement, InfiniteScrollProps>(
  function InfiniteScroll(
    {
      children,
      loadMore,
      hasMore = false,
      pageStart = 0,
      initialLoad = true,
      threshold = 250,
      useWindow = true,
      useCapture = false,
      getScrollParent,
      element: Element = "div",
      isReverse = false,
      loader = null,
      ...props
    },
    forwardedRef
  ) {
    const rootRef = useRef<HTMLElement | null>(null);
    const pageLoadedRef = useRef(pageStart);
    const loadingRef = useRef(false);

    useImperativeHandle(forwardedRef, () => rootRef.current as HTMLElement);

    useEffect(() => {
      pageLoadedRef.current = pageStart;
    }, [pageStart]);

    const getParentElement = useCallback(() => {
      return getScrollParent?.() ?? rootRef.current?.parentElement ?? null;
    }, [getScrollParent]);

    const handleScroll = useCallback(() => {
      const el = rootRef.current;
      const parent = getParentElement();
      if (!el || !parent || !hasMore || loadingRef.current) return;

      let offset: number;
      if (useWindow) {
        const scrollTop = getScrollTop();
        offset = isReverse
          ? scrollTop
          : el.offsetTop + el.offsetHeight - scrollTop - window.innerHeight;
      } else {
        offset = isReverse
          ? parent.scrollTop
          : el.scrollHeight - parent.scrollTop - parent.clientHeight;
      }

      if (offset < threshold && el.offsetParent !== null) {
        loadingRef.current = true;
        pageLoadedRef.current += 1;
        loadMore(pageLoadedRef.current);
      }
    }, [getParentElement, hasMore, isReverse, loadMore, threshold, useWindow]);

    useEffect(() => {
      loadingRef.current = false;
    }, [children, hasMore]);

    useEffect(() => {
      if (!hasMore) return;
      const parent = getParentElement();
      const scrollEl: Window | HTMLElement | null = useWindow ? window : parent;
      if (!scrollEl) return;

      const options = { capture: useCapture, passive: true } as const;
      scrollEl.addEventListener("scroll", handleScroll, options);
      scrollEl.addEventListener("resize", handleScroll, options);
      scrollEl.addEventListener("mousewheel", handleScroll, options);

      if (initialLoad) {
        handleScroll();
      }

      return () => {
        scrollEl.removeEventListener("scroll", handleScroll, options);
        scrollEl.removeEventListener("resize", handleScroll, options);
        scrollEl.removeEventListener("mousewheel", handleScroll, options);
      };
    }, [
      getParentElement,
      handleScroll,
      hasMore,
      initialLoad,
      useCapture,
      useWindow,
    ]);

    return React.createElement(
      Element,
      {
        ...(props as Record<string, unknown>),
        ref: (node: HTMLElement | null) => {
          rootRef.current = node;
        },
      },
      isReverse && hasMore ? loader : null,
      children,
      !isReverse && hasMore ? loader : null
    );
  }
);

export default InfiniteScroll;
