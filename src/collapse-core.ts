import type { SharedValue } from 'react-native-reanimated';

/**
 * The bar's collapse state. `progress` is 0 when expanded and 1 when collapsed
 * to the active tab, and is animated on the UI thread.
 */
export interface TabBarCollapse {
  progress: SharedValue<number>;
  /** Whether the bar is collapsed, or on its way to being collapsed. */
  isCollapsed: () => boolean;
  /** Does nothing when the bar is already heading to `collapsed`, so it is safe to call on every scroll event. */
  setCollapsed: (collapsed: boolean) => void;
}

export interface ScrollCollapseOptions {
  /** Scroll movement (px) below which a change of direction is ignored. @default 4 */
  minDelta?: number;
  /** The bar only collapses once the content has scrolled past this offset (px). @default 24 */
  collapseOffset?: number;
}

export const DEFAULT_MIN_DELTA = 4;
export const DEFAULT_COLLAPSE_OFFSET = 24;
export const COLLAPSE_DURATION_MS = 220;

export function createTabBarCollapse(
  progress: SharedValue<number>,
  animateTo: (value: number) => number,
): TabBarCollapse {
  // Tracked on the JS side: reading `progress` here would block on the UI thread.
  let collapsed = false;

  return {
    progress,
    isCollapsed: () => collapsed,
    setCollapsed: next => {
      if (next === collapsed) return;
      collapsed = next;
      progress.set(animateTo(next ? 1 : 0));
    },
  };
}

/**
 * Decides what a scroll event means for the bar.
 *
 * `lastOffset` is the offset of the last event that counted. Movements smaller
 * than `minDelta` do not count, so a slow drag adds up against the last counted
 * offset instead of being lost. `collapsed` is `undefined` when the event
 * should leave the bar as it is.
 */
export function resolveScroll(
  lastOffset: number,
  offset: number,
  { minDelta = DEFAULT_MIN_DELTA, collapseOffset = DEFAULT_COLLAPSE_OFFSET }: ScrollCollapseOptions = {},
): { lastOffset: number; collapsed: boolean | undefined } {
  const delta = offset - lastOffset;
  if (Math.abs(delta) < minDelta) return { lastOffset, collapsed: undefined };

  if (delta > 0 && offset > collapseOffset) return { lastOffset: offset, collapsed: true };
  if (delta < 0 || offset <= 0) return { lastOffset: offset, collapsed: false };
  return { lastOffset: offset, collapsed: undefined };
}
