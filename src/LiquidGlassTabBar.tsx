import { LiquidGlassTabBarView } from './LiquidGlassTabBarView';
import type { LiquidGlassTabBarViewProps } from './types';

/**
 * The parts of React Navigation's `BottomTabBarProps` that the bar reads. It is
 * declared here, rather than imported, so the package does not depend on a
 * navigation library. The real `BottomTabBarProps` fits it as is.
 */
export interface NavigationTabBarProps {
  state: {
    index: number;
    routes: ReadonlyArray<{ key: string; name: string }>;
  };
  navigation: {
    emit(event: { type: 'tabPress' | 'tabLongPress'; target?: string; canPreventDefault?: boolean }): unknown;
    navigate(name: string): void;
  };
  insets: { bottom: number };
}

export type LiquidGlassTabBarProps = NavigationTabBarProps &
  Omit<LiquidGlassTabBarViewProps, 'activeKey' | 'onItemPress' | 'onItemLongPress' | 'bottomInset'>;

/** React Navigation's event object has `defaultPrevented` set once a listener called `preventDefault()`. */
function wasPrevented(event: unknown) {
  return typeof event === 'object' && event !== null && 'defaultPrevented' in event && !!event.defaultPrevented;
}

/**
 * The tab bar for React Navigation's bottom tabs, which includes Expo Router's
 * `<Tabs>`: it is `LiquidGlassTabBarView` wired to the navigator. Pass it as the
 * navigator's `tabBar`:
 *
 * ```tsx
 * <Tabs tabBar={props => <LiquidGlassTabBar {...props} items={items} bubbleItem={bubble} />} />
 * ```
 *
 * Each item's `key` is a route name. The tabs and the order come from `items`,
 * not from the order of the navigator's screens, and an item whose route is not
 * in the navigator is left out (for example a hidden tab).
 */
export function LiquidGlassTabBar({
  state,
  navigation,
  insets,
  items,
  bubbleItem,
  ...barProps
}: LiquidGlassTabBarProps) {
  const hasRoute = (name: string) => state.routes.some(route => route.name === name);
  const activeKey = state.routes[state.index]?.name;

  const emit = (type: 'tabPress' | 'tabLongPress', name: string) => {
    const route = state.routes.find(candidate => candidate.name === name);
    if (!route) return undefined;
    return navigation.emit({ type, target: route.key, canPreventDefault: type === 'tabPress' });
  };

  return (
    <LiquidGlassTabBarView
      {...barProps}
      items={items.filter(item => hasRoute(item.key))}
      bubbleItem={bubbleItem && hasRoute(bubbleItem.key) ? bubbleItem : undefined}
      activeKey={activeKey}
      bottomInset={insets.bottom}
      onItemPress={name => {
        const event = emit('tabPress', name);
        if (event !== undefined && name !== activeKey && !wasPrevented(event)) {
          navigation.navigate(name);
        }
      }}
      onItemLongPress={name => {
        emit('tabLongPress', name);
      }}
    />
  );
}
