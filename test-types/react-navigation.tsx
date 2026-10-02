// Type-only check, run by `yarn typecheck`: the adapter must accept React
// Navigation's real `BottomTabBarProps` as is, and `LiquidGlassTabBar` must
// accept the props a typical app passes.
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import {
  LiquidGlassTabBar,
  LiquidGlassTabBarAdapter,
  TabBarCollapseProvider,
  useTabBarScrollHandler,
  type TabBarItem,
} from '../src';

const items: TabBarItem[] = [
  { key: 'home', label: 'Home', icon: ({ color, size }) => <Text style={{ color, fontSize: size }}>H</Text> },
  { key: 'inbox', label: 'Inbox', badge: 3, icon: ({ color }) => <Text style={{ color }}>I</Text> },
];
const bubbleItem: TabBarItem = { key: 'search', label: 'Search', icon: ({ color }) => <Text style={{ color }}>S</Text> };

export function tabBar(props: BottomTabBarProps) {
  return <LiquidGlassTabBarAdapter {...props} items={items} bubbleItem={bubbleItem} />;
}

export function controlled() {
  const onScroll = useTabBarScrollHandler();
  void onScroll;
  return (
    <TabBarCollapseProvider>
      <LiquidGlassTabBar
        items={items}
        bubbleItem={bubbleItem}
        activeKey="home"
        onItemPress={() => {}}
        layoutDirection="rtl"
        theme={{ activeColor: '#000' }}
      />
    </TabBarCollapseProvider>
  );
}
