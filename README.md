# reanimated-liquid-glass-tab-bar

A floating, frosted-glass tab bar for React Native, built with [Reanimated](https://docs.swmansion.com/react-native-reanimated/).

- **A pill of tabs** over a blurred, tinted glass surface, floating above the content.
- **Collapses on scroll.** Scrolling down shrinks the pill to the current tab's icon, scrolling up expands it, and tapping the collapsed icon expands it too. The animation runs on the UI thread.
- **An optional bubble tab** drawn as its own circle next to the pill. It never collapses, so it is always one tap away (a cart, a search, a compose button).
- **Badges** on any tab, with a count cap such as `99+`.
- **Bring your own icons and colors.** Icons are plain render functions, so any icon library works. Colors, blur and badge style are props.
- **Works with Expo Router and React Navigation** through a ready-made adapter, or on its own as a controlled component.
- **Right-to-left aware.** The bar is either always left to right, or fully mirrored.
- Accessible: every tab is a `tab` with a label that includes its badge.

## Install

```sh
yarn add reanimated-liquid-glass-tab-bar
# or: npm install reanimated-liquid-glass-tab-bar
```

The package needs these peer dependencies. In an Expo app, install them with `npx expo install`:

```sh
npx expo install expo-blur react-native-reanimated react-native-worklets
```

| Peer dependency          | Version     |
| ------------------------ | ----------- |
| `react`                  | `>=18`      |
| `react-native`           | `>=0.76`    |
| `react-native-reanimated`| `>=3.16.0` (3.x and 4.x) |
| `expo-blur`              | `>=15.0.0`  |

`react-native-reanimated` 4 also needs `react-native-worklets`, as its own installation guide describes. The package itself contains no native code.

## Quick start

### Expo Router

Render `TabBarCollapseProvider` around the navigator, and pass the bar as the `tabBar` of `<Tabs>`. Each item's `key` is a **route name**.

```tsx
// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import {
  LiquidGlassTabBarAdapter,
  TabBarCollapseProvider,
  type TabBarItem,
} from 'reanimated-liquid-glass-tab-bar';

const items: TabBarItem[] = [
  {
    key: 'home',
    label: 'Home',
    icon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
  },
  {
    key: 'inbox',
    label: 'Inbox',
    badge: 3,
    icon: ({ color, size }) => <Ionicons name="mail-outline" color={color} size={size} />,
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
  },
];

const bubbleItem: TabBarItem = {
  key: 'search',
  label: 'Search',
  icon: ({ color, size }) => <Ionicons name="search-outline" color={color} size={size} />,
};

export default function TabsLayout() {
  return (
    <TabBarCollapseProvider>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={props => (
          <LiquidGlassTabBarAdapter {...props} items={items} bubbleItem={bubbleItem} />
        )}>
        <Tabs.Screen name="home" />
        <Tabs.Screen name="inbox" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="search" />
      </Tabs>
    </TabBarCollapseProvider>
  );
}
```

The tabs and their order come from `items`, not from the order of the `<Tabs.Screen>` elements. An item whose route is not in the navigator is left out, which is how a hidden tab (`href: null`) stays out of the bar.

### React Navigation

The adapter takes React Navigation's `BottomTabBarProps` as they are:

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LiquidGlassTabBarAdapter, TabBarCollapseProvider } from 'reanimated-liquid-glass-tab-bar';

const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <TabBarCollapseProvider>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={props => <LiquidGlassTabBarAdapter {...props} items={items} bubbleItem={bubbleItem} />}>
        <Tab.Screen name="home" component={HomeScreen} />
        {/* ... */}
      </Tab.Navigator>
    </TabBarCollapseProvider>
  );
}
```

## Collapse on scroll

The bar collapses while a screen scrolls down. Connect a screen by giving its main scroll view the handler from `useTabBarScrollHandler`:

```tsx
import { FlatList } from 'react-native';
import { useTabBarScrollHandler } from 'reanimated-liquid-glass-tab-bar';

function HomeScreen() {
  const onScroll = useTabBarScrollHandler();

  return <FlatList data={data} renderItem={renderItem} onScroll={onScroll} scrollEventThrottle={16} />;
}
```

The handler is `undefined` outside a `TabBarCollapseProvider`, which leaves the scroll view untouched, so a screen can be used with or without the bar. Screens that never call the hook simply never collapse the bar.

The bar collapses once the content has scrolled past `24` px, and ignores movements smaller than `4` px. Change both through the hook's options:

```tsx
const onScroll = useTabBarScrollHandler({ collapseOffset: 80, minDelta: 8 });
```

Every screen keeps its own scroll position, so switching tabs does not look like a big scroll to the next screen. The bar also expands whenever the focused tab changes.

### Without a React Native scroll event

`useTabBarScrollTracker` takes the vertical offset (px) directly, for anything that is not a React Native scroll view, such as a list library with its own callback:

```tsx
const trackScroll = useTabBarScrollTracker();
// call trackScroll?.(offsetY) from your scroll callback
```

### Controlling the collapse yourself

`useTabBarCollapse()` creates the collapse state, which exposes `progress` (a Reanimated shared value, `0` expanded to `1` collapsed), `isCollapsed()` and `setCollapsed(boolean)`. Hand it to the provider (`<TabBarCollapseProvider value={collapse}>`) or to the bar's `collapse` prop to collapse or expand the bar from your own code.

## Making room for the bar

The bar floats over the screens and does not reserve any space, so scrollable content needs bottom padding to clear it:

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_BOTTOM_MARGIN, TAB_BAR_HEIGHT } from 'reanimated-liquid-glass-tab-bar';

const { bottom } = useSafeAreaInsets();
const clearance = bottom + TAB_BAR_HEIGHT + DEFAULT_BOTTOM_MARGIN;

<FlatList contentContainerStyle={{ paddingBottom: clearance + 16 }} /* ... */ />;
```

`TAB_BAR_HEIGHT` (`56`) is also the diameter of the bubble. If you change the bar's `bottomMargin`, use your value instead of `DEFAULT_BOTTOM_MARGIN`.

## Items, icons and badges

An item is `{ key, label, icon, badge? }`:

- `key` is unique inside the bar. With the React Navigation adapter it is the route name.
- `label` is read by screen readers. The bar draws icons only.
- `icon` is a function that receives `{ color, size, focused }` and returns an element. The color is the theme's active or inactive color, so the icon follows the theme without extra work:

```tsx
icon: ({ color, size, focused }) => (
  <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size} />
),
```

- `badge` is a number or a short string. It is hidden when it is `0`, negative or empty, and a count above `maxBadgeCount` (default `99`) shows as `99+`. Screen readers hear the real count: `"Inbox, 120"`.

```tsx
const items: TabBarItem[] = [
  { key: 'inbox', label: 'Inbox', badge: unreadCount, icon: /* ... */ },
];

<LiquidGlassTabBarAdapter {...props} items={items} maxBadgeCount={9} />;
```

Badges are positioned inside each icon's own box, not on the pill's edge. The pill (when collapsed) and the bubble are full circles clipped to their shape, and a badge on the corner of that circle would be cut off.

### The bubble

`bubbleItem` is a tab drawn as its own circle at the other end of the bar. It never collapses, which makes it a good home for the one action that must always be reachable. It takes the same shape as an item, and its `key` must differ from every item's. While the bubble is focused, the collapsed pill keeps showing the tab that was focused before it.

Leave `bubbleItem` out for a bar with only the pill.

## Theming

Pass any part of the theme; the rest keeps its default:

```tsx
<LiquidGlassTabBarAdapter
  {...props}
  items={items}
  theme={{
    activeColor: '#0A84FF',
    inactiveColor: '#8E8E93',
    badgeBackgroundColor: '#0A84FF',
  }}
/>
```

| Theme key              | Default                    | Meaning                                                          |
| ---------------------- | -------------------------- | ---------------------------------------------------------------- |
| `activeColor`          | `#007AFF`                  | Icon color of the focused item, and of the circle behind it.     |
| `inactiveColor`        | `#636366`                  | Icon color of the other items.                                   |
| `highlightOpacity`     | `0.18`                     | Opacity of the circle behind the focused icon.                   |
| `glassTint`            | `rgba(255,255,255,0.55)`   | Color laid over the blur, so icons stay legible on any content.  |
| `borderColor`          | `rgba(255,255,255,0.5)`    | The thin outline of the glass.                                   |
| `shadowColor`          | `#000000`                  | Color of the shadow under the bar.                               |
| `badgeBackgroundColor` | `#FF3B30`                  | Badge fill.                                                      |
| `badgeTextColor`       | `#FFFFFF`                  | Badge text.                                                      |

The blur has its own props: `blurIntensity` (`70`) and `blurTint` (`'light'`, or any `expo-blur` tint). The default theme is made for light content. For a dark app:

```tsx
const dark = {
  activeColor: '#0A84FF',
  inactiveColor: '#98989D',
  glassTint: 'rgba(28,28,30,0.55)',
  borderColor: 'rgba(255,255,255,0.15)',
};

<LiquidGlassTabBarAdapter {...props} items={items} theme={dark} blurTint="dark" />;
```

To set a font on the badge, use `badgeTextStyle`:

```tsx
<LiquidGlassTabBarAdapter {...props} items={items} badgeTextStyle={{ fontFamily: 'Inter-Bold' }} />
```

## Blur on Android

On iOS the glass uses a real blur. On Android, `expo-blur` only blurs what is inside a `BlurTargetView`, so without one the bar shows its translucent tint (`glassTint`) over the content, which keeps it legible but is not a blur.

For a real blur on Android, wrap the content that should show through the bar in a `BlurTargetView` and pass its ref as `blurTarget`. Render the bar next to that view, not inside it. See the [`expo-blur` documentation](https://docs.expo.dev/versions/latest/sdk/blur-view/) for how targets work.

```tsx
import { BlurTargetView } from 'expo-blur';

const target = useRef<View>(null);

<>
  <BlurTargetView ref={target} style={{ flex: 1 }}>
    {/* the content behind the bar */}
  </BlurTargetView>
  <LiquidGlassTabBar {...barProps} blurTarget={target} />
</>;
```

`blurMethod` (default `'dimezisBlurViewSdk31Plus'`) is passed to `BlurView` together with `blurTarget`. Both props are ignored on iOS.

## Right-to-left languages

By default the bar is laid out left to right in every language: the first item is on the left and the bubble on the right, even in an app running right to left. The order of the tabs never changes with the language, which keeps it identical to a native tab bar that does not mirror.

To mirror the bar instead, set `layoutDirection="rtl"` (for example when `I18nManager.isRTL` is true): the first item moves to the right and the bubble to the left, and the collapse slides the other way.

```tsx
import { I18nManager } from 'react-native';

<LiquidGlassTabBarAdapter
  {...props}
  items={items}
  layoutDirection={I18nManager.isRTL ? 'rtl' : 'ltr'}
/>;
```

## Hiding the bar

`tabBar` may return `null`, so the bar can be hidden on any screen, for example a detail screen:

```tsx
tabBar={props => (hideBar ? null : <LiquidGlassTabBarAdapter {...props} items={items} />)}
```

## Without a navigator

`LiquidGlassTabBar` is the bar itself. It is controlled and has no navigation inside: you give it the focused key and handle presses. This is what `LiquidGlassTabBarAdapter` uses.

```tsx
import { useState } from 'react';
import { LiquidGlassTabBar } from 'reanimated-liquid-glass-tab-bar';

function App() {
  const [active, setActive] = useState('home');
  const { bottom } = useSafeAreaInsets();

  return (
    <>
      {/* your screens */}
      <LiquidGlassTabBar
        items={items}
        bubbleItem={bubbleItem}
        activeKey={active}
        onItemPress={setActive}
        bottomInset={bottom}
      />
    </>
  );
}
```

Without a collapse state (no provider and no `collapse` prop) the bar never collapses.

## API

### `LiquidGlassTabBar`

| Prop               | Type                                  | Default                       | Description                                                                                          |
| ------------------ | ------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| `items`            | `TabBarItem[]`                        | required                      | The tabs in the pill, in order.                                                                      |
| `bubbleItem`       | `TabBarItem`                          |                               | The tab drawn as its own circle. Never collapses.                                                    |
| `activeKey`        | `string \| undefined`                 | required                      | The `key` of the focused item or bubble.                                                             |
| `onItemPress`      | `(key: string) => void`               | required                      | Called on every tap, including the focused tab. Tapping the focused tab while collapsed only expands the pill. |
| `onItemLongPress`  | `(key: string) => void`               |                               |                                                                                                      |
| `collapse`         | `TabBarCollapse`                      | the provider's                | Collapse state. Without a provider or this prop the bar never collapses.                             |
| `bottomInset`      | `number`                              | `0`                           | Safe-area bottom inset to float above.                                                               |
| `bottomMargin`     | `number`                              | `12`                          | Gap between the bar and the bottom inset.                                                            |
| `horizontalMargin` | `number`                              | `16`                          | Gap between the bar and the screen edges.                                                            |
| `layoutDirection`  | `'ltr' \| 'rtl'`                      | `'ltr'`                       | `'ltr'` never mirrors. `'rtl'` mirrors the whole bar.                                                |
| `iconSize`         | `number`                              | `24`                          | Passed to each item's `icon`.                                                                        |
| `maxBadgeCount`    | `number`                              | `99`                          | Counts above this show as `<max>+`.                                                                  |
| `theme`            | `Partial<LiquidGlassTabBarTheme>`     |                               | See [Theming](#theming).                                                                             |
| `badgeTextStyle`   | `StyleProp<TextStyle>`                |                               | Merged over the badge text's style.                                                                  |
| `blurIntensity`    | `number`                              | `70`                          | `1` to `100`.                                                                                        |
| `blurTint`         | `BlurView` tint                       | `'light'`                     | Any `expo-blur` tint.                                                                                |
| `blurTarget`       | `RefObject<View \| null>`             |                               | Android only. See [Blur on Android](#blur-on-android).                                               |
| `blurMethod`       | `BlurView` `blurMethod`               | `'dimezisBlurViewSdk31Plus'`  | Android only, used with `blurTarget`.                                                                |
| `style`            | `StyleProp<ViewStyle>`                |                               | Style of the full-width container that positions the bar.                                            |
| `testID`           | `string`                              |                               |                                                                                                      |

### `LiquidGlassTabBarAdapter`

Takes everything above except `activeKey`, `onItemPress`, `onItemLongPress` and `bottomInset`, plus React Navigation's `BottomTabBarProps` (`state`, `navigation`, `insets`, and any other prop you spread in). It:

- uses the focused route's name as `activeKey` and `insets.bottom` as `bottomInset`;
- emits `tabPress` and `tabLongPress`, and navigates unless a listener called `preventDefault()`, so listeners such as scroll-to-top keep working;
- leaves out items whose route is not in the navigator.

### `TabBarItem`

| Field   | Type                                         | Description                                                                |
| ------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| `key`   | `string`                                     | Unique in the bar. A route name with the adapter.                          |
| `label` | `string`                                     | Read by screen readers.                                                    |
| `icon`  | `(props: TabBarIconProps) => ReactNode`      | `props` is `{ color: string; size: number; focused: boolean }`.            |
| `badge` | `number \| string`                           | Hidden when `0`, negative or empty.                                        |

### Collapse

| Export                     | Description                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `TabBarCollapseProvider`   | Creates the collapse state and shares it with the bar and the screens below it. Accepts `value` to use your own.   |
| `useTabBarScrollHandler`   | `(options?) => onScroll \| undefined`. The `onScroll` for a screen's main scroll view.                             |
| `useTabBarScrollTracker`   | `(options?) => ((offsetY: number) => void) \| undefined`. The same, for a plain scroll offset.                     |
| `useTabBarCollapse`        | Creates a collapse state: `{ progress, isCollapsed(), setCollapsed(collapsed) }`.                                  |

Options of the two scroll hooks: `collapseOffset` (px, default `24`) and `minDelta` (px, default `4`).

### Constants

`TAB_BAR_HEIGHT` (`56`), `DEFAULT_BOTTOM_MARGIN` (`12`) and `DEFAULT_HORIZONTAL_MARGIN` (`16`).

## Good to know

- **iOS and Android.** The package is built for React Native on these two platforms. Web has not been tested.
- **A `BlurView` is used on both platforms**, so the bar needs `expo-blur` even in an app that is not otherwise an Expo app.
- **The pill's width is fixed per tab:** each slot is `56` px wide, and the bar is `56` px tall. The height and the slot width are not configurable.
- **React Compiler** is not required, and the package works with it.

## Development

```sh
yarn install
yarn typecheck   # the source, and type tests against React Navigation's own types
yarn test        # builds, then runs the tests of the collapse logic
yarn build       # builds lib/ (CommonJS, ES modules and type declarations)
```

Releases use [release-it](https://github.com/release-it/release-it): `yarn release`, or `yarn release:beta` for a pre-release.

## License

MIT
