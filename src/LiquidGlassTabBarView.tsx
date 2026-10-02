import { useContext, useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { BlurView, type BlurViewProps } from 'expo-blur';
import { TabBarCollapseContext } from './collapse';
import { DEFAULT_BOTTOM_MARGIN, DEFAULT_HORIZONTAL_MARGIN, TAB_BAR_HEIGHT } from './constants';
import type { LiquidGlassTabBarViewProps, LiquidGlassTabBarTheme, TabBarItem } from './types';

/** Width of one tab in the pill; also the width of the pill when collapsed. */
const SLOT_WIDTH = TAB_BAR_HEIGHT;
const ICON_BOX_SIZE = 44;
const BADGE_SIZE = 18;
/**
 * Offset from the *icon box's* top and end edge, not the pill's or bubble's.
 * The pill (collapsed) and the bubble are full circles clipped by
 * `overflow: 'hidden'`, and a corner badge placed any closer to their outer
 * edge gets cut off by that circle.
 */
const BADGE_INSET = 6;

const defaultTheme: LiquidGlassTabBarTheme = {
  activeColor: '#007AFF',
  inactiveColor: '#636366',
  highlightOpacity: 0.18,
  glassTint: 'rgba(255,255,255,0.55)',
  borderColor: 'rgba(255,255,255,0.5)',
  shadowColor: '#000000',
  badgeBackgroundColor: '#FF3B30',
  badgeTextColor: '#FFFFFF',
};

/**
 * A floating "liquid glass" tab bar: a frosted pill holding the main tabs,
 * which shrinks to the focused tab's icon while the screen scrolls down, plus
 * an optional bubble tab that never collapses.
 *
 * It is a controlled component with no navigation inside. For React Navigation
 * and Expo Router use `LiquidGlassTabBar`.
 */
export function LiquidGlassTabBarView({
  items,
  bubbleItem,
  activeKey,
  onItemPress,
  onItemLongPress,
  collapse: collapseProp,
  bottomInset = 0,
  bottomMargin = DEFAULT_BOTTOM_MARGIN,
  horizontalMargin = DEFAULT_HORIZONTAL_MARGIN,
  layoutDirection = 'ltr',
  iconSize = 24,
  maxBadgeCount = 99,
  theme,
  badgeTextStyle,
  blurIntensity = 70,
  blurTint = 'light',
  blurTarget,
  blurMethod = 'dimezisBlurViewSdk31Plus',
  style,
  testID,
}: LiquidGlassTabBarViewProps) {
  const colors = { ...defaultTheme, ...theme };
  const contextCollapse = useContext(TabBarCollapseContext);
  const collapse = collapseProp ?? contextCollapse;
  const fallbackProgress = useSharedValue(0);
  const progress = collapse?.progress ?? fallbackProgress;

  const focusedIndex = items.findIndex(item => item.key === activeKey);

  // The collapsed pill shows the focused tab. While the bubble is focused there
  // is none, so it keeps showing the tab that was focused before it.
  const [lastIndex, setLastIndex] = useState(0);
  if (focusedIndex >= 0 && focusedIndex !== lastIndex) {
    setLastIndex(focusedIndex);
  }
  const activeIndex = focusedIndex >= 0 ? focusedIndex : Math.min(lastIndex, Math.max(items.length - 1, 0));

  useEffect(
    function expandOnFocusChange() {
      collapse?.setCollapsed(false);
    },
    [activeKey, collapse],
  );

  // Collapsing slides the row so the active slot lines up with the pill's
  // start edge: to the left in `ltr`, to the right in `rtl`.
  const slideDirection = layoutDirection === 'rtl' ? 1 : -1;

  const pillStyle = useAnimatedStyle(
    () => ({
      width: interpolate(progress.get(), [0, 1], [SLOT_WIDTH * items.length, SLOT_WIDTH]),
    }),
    [progress, items.length],
  );

  const rowStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: interpolate(progress.get(), [0, 1], [0, slideDirection * activeIndex * SLOT_WIDTH]),
        },
      ],
    }),
    [progress, activeIndex, slideDirection],
  );

  const onPress = (key: string) => {
    // Collapsed, the pill only shows the focused tab: tapping it brings the
    // rest back, like the minimized iOS tab bar.
    if (key === activeKey && collapse?.isCollapsed()) {
      collapse.setCollapsed(false);
      return;
    }
    onItemPress(key);
  };

  const glass = (
    <GlassBackground
      colors={colors}
      intensity={blurIntensity}
      tint={blurTint}
      blurTarget={blurTarget}
      blurMethod={blurMethod}
    />
  );

  const renderBadge = (item: TabBarItem) => (
    <TabBadge value={item.badge} max={maxBadgeCount} colors={colors} textStyle={badgeTextStyle} />
  );

  const renderIcon = (item: TabBarItem) => {
    const focused = item.key === activeKey;
    return item.icon({
      color: focused ? colors.activeColor : colors.inactiveColor,
      size: iconSize,
      focused,
    });
  };

  return (
    <View
      pointerEvents="box-none"
      testID={testID}
      style={[
        styles.container,
        {
          direction: layoutDirection,
          bottom: bottomInset + bottomMargin,
          paddingHorizontal: horizontalMargin,
          justifyContent: items.length > 0 ? 'space-between' : 'flex-end',
        },
        style,
      ]}>
      {items.length > 0 ? (
        <Animated.View style={[styles.pill, glassSurface(colors), pillStyle]}>
          {glass}
          <Animated.View style={[styles.row, rowStyle]}>
            {items.map((item, index) => (
              <PillTab
                key={item.key}
                label={describe(item)}
                isFocused={item.key === activeKey}
                isActiveSlot={index === activeIndex}
                progress={progress}
                highlightColor={colors.activeColor}
                highlightOpacity={colors.highlightOpacity}
                badge={renderBadge(item)}
                onPress={() => onPress(item.key)}
                onLongPress={() => onItemLongPress?.(item.key)}>
                {renderIcon(item)}
              </PillTab>
            ))}
          </Animated.View>
        </Animated.View>
      ) : null}

      {bubbleItem ? (
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel={describe(bubbleItem)}
          accessibilityState={{ selected: bubbleItem.key === activeKey }}
          style={[styles.bubble, glassSurface(colors)]}
          onPress={() => onPress(bubbleItem.key)}
          onLongPress={() => onItemLongPress?.(bubbleItem.key)}>
          {glass}
          <View style={styles.iconBox}>
            {renderIcon(bubbleItem)}
            {renderBadge(bubbleItem)}
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

/** The accessibility label: the item's label, plus its badge when it shows one. */
function describe(item: TabBarItem) {
  return hasBadge(item.badge) ? `${item.label}, ${item.badge}` : item.label;
}

function hasBadge(badge: TabBarItem['badge']): badge is number | string {
  if (typeof badge === 'number') return badge > 0;
  return !!badge;
}

interface PillTabProps {
  label: string;
  isFocused: boolean;
  isActiveSlot: boolean;
  progress: SharedValue<number>;
  highlightColor: string;
  highlightOpacity: number;
  badge: ReactNode;
  children: ReactNode;
  onPress: () => void;
  onLongPress: () => void;
}

function PillTab({
  label,
  isFocused,
  isActiveSlot,
  progress,
  highlightColor,
  highlightOpacity,
  badge,
  children,
  onPress,
  onLongPress,
}: PillTabProps) {
  // Every slot except the one the collapsed pill is windowed on fades out as it
  // collapses, otherwise the crop alone leaves the neighbours' edges showing.
  const fadeStyle = useAnimatedStyle(
    () => ({
      opacity: isActiveSlot ? 1 : interpolate(progress.get(), [0, 0.6, 1], [1, 0, 0]),
    }),
    [progress, isActiveSlot],
  );

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={styles.slot}
      onPress={onPress}
      onLongPress={onLongPress}>
      <Animated.View style={[styles.iconBox, fadeStyle]}>
        {isFocused ? (
          <View style={[styles.highlight, { backgroundColor: highlightColor, opacity: highlightOpacity }]} />
        ) : null}
        {children}
        {badge}
      </Animated.View>
    </Pressable>
  );
}

interface TabBadgeProps {
  value: TabBarItem['badge'];
  max: number;
  colors: LiquidGlassTabBarTheme;
  textStyle: LiquidGlassTabBarViewProps['badgeTextStyle'];
}

function TabBadge({ value, max, colors, textStyle }: TabBadgeProps) {
  if (!hasBadge(value)) return null;
  const text = typeof value === 'number' && value > max ? `${max}+` : String(value);

  return (
    <View pointerEvents="none" style={[styles.badge, { backgroundColor: colors.badgeBackgroundColor }]}>
      <Text style={[styles.badgeText, { color: colors.badgeTextColor }, textStyle]}>{text}</Text>
    </View>
  );
}

interface GlassBackgroundProps {
  colors: LiquidGlassTabBarTheme;
  intensity: number;
  tint: BlurViewProps['tint'];
  blurTarget: BlurViewProps['blurTarget'];
  blurMethod: BlurViewProps['blurMethod'];
}

/**
 * Without a `blurTarget`, Android shows a translucent tint instead of a blur,
 * so the extra tint layer keeps the icons legible either way.
 */
function GlassBackground({ colors, intensity, tint, blurTarget, blurMethod }: GlassBackgroundProps) {
  return (
    <>
      <BlurView
        pointerEvents="none"
        tint={tint}
        intensity={intensity}
        blurTarget={blurTarget}
        blurMethod={blurTarget ? blurMethod : undefined}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassTint }]} />
    </>
  );
}

function glassSurface(colors: LiquidGlassTabBarTheme): ViewStyle {
  return {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderColor,
    elevation: 8,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
  },
  bubble: {
    width: TAB_BAR_HEIGHT,
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  slot: {
    width: SLOT_WIDTH,
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: ICON_BOX_SIZE,
    height: ICON_BOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlight: {
    position: 'absolute',
    width: ICON_BOX_SIZE,
    height: ICON_BOX_SIZE,
    borderRadius: ICON_BOX_SIZE / 2,
  },
  badge: {
    position: 'absolute',
    top: BADGE_INSET,
    // `end`, not `right`: it follows `layoutDirection`, while `right` can be swapped by the app's RTL setting.
    end: BADGE_INSET,
    minWidth: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
});
