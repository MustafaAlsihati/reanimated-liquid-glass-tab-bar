import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { BlurViewProps } from 'expo-blur';
import type { TabBarCollapse } from './collapse-core';

export interface TabBarIconProps {
  /** The active or inactive color, depending on whether the item is focused. */
  color: string;
  size: number;
  focused: boolean;
}

export interface TabBarItem {
  /** Unique within the bar. With `LiquidGlassTabBar` this is the route name. */
  key: string;
  /** Read by screen readers. The bar shows icons only. */
  label: string;
  icon: (props: TabBarIconProps) => ReactNode;
  /**
   * A count, or any short text, shown in a small badge on the icon. Hidden when
   * it is `0`, negative or empty. Counts above `maxBadgeCount` show as `99+`.
   */
  badge?: number | string;
}

export interface LiquidGlassTabBarTheme {
  /** Icon color of the focused item. @default '#007AFF' */
  activeColor: string;
  /** Icon color of the other items. @default '#636366' */
  inactiveColor: string;
  /** Opacity of the circle behind the focused icon, drawn in `activeColor`. @default 0.18 */
  highlightOpacity: number;
  /** Color laid over the blur, so the icons stay legible on any content. @default 'rgba(255,255,255,0.55)' */
  glassTint: string;
  /** @default 'rgba(255,255,255,0.5)' */
  borderColor: string;
  /** @default '#FF3B30' */
  badgeBackgroundColor: string;
  /** @default '#FFFFFF' */
  badgeTextColor: string;
}

export interface LiquidGlassTabBarViewProps {
  /** The tabs in the pill, in order. */
  items: TabBarItem[];
  /**
   * An extra tab drawn as its own circle next to the pill. It never collapses,
   * so it is always one tap away. Its `key` must differ from every item's.
   */
  bubbleItem?: TabBarItem;
  /** The `key` of the focused item or bubble. */
  activeKey: string | undefined;
  /**
   * Called when an item or the bubble is tapped, including the focused one.
   * The one exception: tapping the focused item while the pill is collapsed
   * only expands the pill.
   */
  onItemPress: (key: string) => void;
  onItemLongPress?: (key: string) => void;
  /**
   * Collapse state. Defaults to the one from the nearest `TabBarCollapseProvider`.
   * Without either, the bar never collapses.
   */
  collapse?: TabBarCollapse;
  /** Safe-area bottom inset to float above. @default 0 */
  bottomInset?: number;
  /** Gap between the bar and the bottom inset. @default 12 */
  bottomMargin?: number;
  /** Gap between the bar and the left/right screen edges. @default 16 */
  horizontalMargin?: number;
  /**
   * `'ltr'` lays the bar out left to right in every language, so the order of
   * the tabs never changes. `'rtl'` mirrors it: the first item sits on the
   * right and the bubble on the left. @default 'ltr'
   */
  layoutDirection?: 'ltr' | 'rtl';
  /** @default 24 */
  iconSize?: number;
  /** Counts above this show as `<max>+`. @default 99 */
  maxBadgeCount?: number;
  theme?: Partial<LiquidGlassTabBarTheme>;
  /** Merged over the badge text's default style, for example to set a `fontFamily`. */
  badgeTextStyle?: StyleProp<TextStyle>;
  /** @default 70 */
  blurIntensity?: number;
  /** @default 'light' */
  blurTint?: BlurViewProps['tint'];
  /**
   * Android only. The `BlurTargetView` (from `expo-blur`) that wraps the content
   * behind the bar. Without it Android shows a translucent tint instead of a blur.
   */
  blurTarget?: BlurViewProps['blurTarget'];
  /** Android only, used with `blurTarget`. @default 'dimezisBlurViewSdk31Plus' */
  blurMethod?: BlurViewProps['blurMethod'];
  /** Style of the full-width container that positions the bar. */
  style?: StyleProp<ViewStyle>;
  /**
   * Merged over the style of the glass surfaces: the pill and the bubble. Use it for
   * `elevation` (the shadow on Android) or a different `borderWidth`. Android draws
   * an elevation shadow through the translucent glass, which shows as a lighter patch.
   */
  surfaceStyle?: StyleProp<ViewStyle>;
  testID?: string;
}
