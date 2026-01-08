import { useState, useEffect, useMemo, useRef } from "preact/hooks";

interface UseVirtualizerOptions {
  count: number;
  getScrollElement: () => HTMLElement | null;
  estimateSize: (index: number) => number;
  overscan?: number;
}

interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
}

export function useVirtualizer({
  count,
  getScrollElement,
  estimateSize,
  overscan = 5,
}: UseVirtualizerOptions) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const measurementCache = useRef<Record<number, number>>({});

  // Reset cache when count changes
  useEffect(() => {
    measurementCache.current = {};
  }, [count]);

  useEffect(() => {
    const element = getScrollElement();
    if (!element) return;

    const handleScroll = () => {
      setScrollOffset(element.scrollTop);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element) {
          setContainerHeight(entry.contentRect.height);
        }
      }
    });

    element.addEventListener("scroll", handleScroll, { passive: true });
    resizeObserver.observe(element);

    // Initial measurement
    setContainerHeight(element.clientHeight);

    return () => {
      element.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [getScrollElement]);

  const { totalSize, virtualItems } = useMemo(() => {
    const items: VirtualItem[] = [];
    let start = 0;

    for (let i = 0; i < count; i++) {
      const size = estimateSize(i);
      items.push({
        index: i,
        start,
        size,
        end: start + size,
      });
      start += size;
    }

    // Binary search for visible range
    // Simplified: Linear search is fine for <10k items usually, but robust virtualizers use binary search.
    // For this custom hook, we'll keep it simple for now and optimize if needed.

    let startIndex = 0;
    let endIndex = count - 1;

    // Find start index
    for (let i = 0; i < count; i++) {
      if (items[i].end > scrollOffset) {
        startIndex = i;
        break;
      }
    }

    // Find end index
    for (let i = startIndex; i < count; i++) {
      if (items[i].start > scrollOffset + containerHeight) {
        endIndex = i;
        break;
      }
    }

    // Apply overscan
    startIndex = Math.max(0, startIndex - overscan);
    endIndex = Math.min(count - 1, endIndex + overscan);

    const visibleItems = items.slice(startIndex, endIndex + 1);

    return {
      totalSize: start,
      virtualItems: visibleItems,
    };
  }, [count, estimateSize, scrollOffset, containerHeight, overscan]);

  return {
    virtualItems,
    totalSize,
  };
}
