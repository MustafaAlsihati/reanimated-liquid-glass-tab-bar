import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import {
  COLLAPSE_DURATION_MS,
  createTabBarCollapse,
  resolveScroll,
  type ScrollCollapseOptions,
  type TabBarCollapse,
} from './collapse-core';

export const TabBarCollapseContext = createContext<TabBarCollapse | null>(null);

/**
 * Creates the collapse state. Most apps do not need this directly: render a
 * `TabBarCollapseProvider` around the navigator instead.
 */
export function useTabBarCollapse(): TabBarCollapse {
  const progress = useSharedValue(0);
  const [collapse] = useState(() =>
    createTabBarCollapse(progress, value => withTiming(value, { duration: COLLAPSE_DURATION_MS })),
  );
  return collapse;
}

interface TabBarCollapseProviderProps {
  /** Use your own collapse state (from `useTabBarCollapse`). By default the provider creates one. */
  value?: TabBarCollapse;
  children: ReactNode;
}

/**
 * Connects the tab bar to the screens' scroll views. Render it around the
 * navigator, so that both the bar and every screen are inside it.
 */
export function TabBarCollapseProvider({ value, children }: TabBarCollapseProviderProps) {
  const own = useTabBarCollapse();
  return <TabBarCollapseContext.Provider value={value ?? own}>{children}</TabBarCollapseContext.Provider>;
}

/**
 * Returns a function to call with the current vertical scroll offset (px): it
 * collapses the bar while scrolling down and expands it while scrolling up.
 * Use it where there is no React Native scroll event, for example a window
 * scroll listener. Returns `undefined` outside a `TabBarCollapseProvider`.
 */
export function useTabBarScrollTracker(options?: ScrollCollapseOptions): ((offsetY: number) => void) | undefined {
  const collapse = useContext(TabBarCollapseContext);
  // One per screen: sharing the last offset between screens would make the
  // first scroll event after switching tabs look like a big jump.
  const lastOffset = useRef(0);

  if (!collapse) return undefined;

  return offsetY => {
    const result = resolveScroll(lastOffset.current, offsetY, options);
    lastOffset.current = result.lastOffset;
    if (result.collapsed !== undefined) collapse.setCollapsed(result.collapsed);
  };
}

/**
 * `onScroll` for a screen's main scroll view (use it with
 * `scrollEventThrottle={16}`). Returns `undefined` outside a
 * `TabBarCollapseProvider`, which leaves the scroll view untouched.
 */
export function useTabBarScrollHandler(
  options?: ScrollCollapseOptions,
): ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) | undefined {
  const track = useTabBarScrollTracker(options);
  if (!track) return undefined;
  return event => track(event.nativeEvent.contentOffset.y);
}
